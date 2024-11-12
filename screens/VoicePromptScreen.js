// screens/VoicePromptScreen.js
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View, Animated, Easing } from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Audio, InterruptionModeAndroid, InterruptionModeIOS} from 'expo-av';
import {UserDataContext} from '../utils/UserDataContext';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from 'expo-file-system';
import base64 from 'react-native-base64';
import Toast from 'react-native-root-toast';

export default function VoicePromptScreen({ navigation }) {
    const recording = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const { userInfo, setUserInfo, setUserCustomer, versionInfo } = useContext(UserDataContext);
    const [socket, setSocket] = useState(null);
    const [audioQueue, setAudioQueue] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const soundRef = useRef(new Audio.Sound());
    const mergedAudioData = useRef(''); // 用于保存合并后的 PCM 音频数据
    const [toastVisible, setToastVisible] = useState(false);

    const bounceValue = useState(new Animated.Value(0))[0];
    useEffect(() => {
        startBouncing();
    }, []);
    const startBouncing = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(bounceValue, {
                    toValue: -10, // Move up by 10 units
                    duration: 300,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(bounceValue, {
                    toValue: 0, // Move back down
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const showToast = (message) => {
        // 显示 Toast，默认 2 秒后消失
        Toast.show(message, {
            duration: Toast.durations.SHORT,
            position: Toast.positions.CENTER, // 你可以设置 TOP 或 CENTER
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
        });

        // 设置定时器隐藏 Toast
        setToastVisible(true);
        setTimeout(() => {
            setToastVisible(false);
        }, 5000); // 2000 毫秒 = 2 秒
    };

    const recordingOptions = {
        ios: {
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM, // 使用 LINEARPCM 格式
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 24000, // 设置常用的高质量采样率
            numberOfChannels: 1, // 单声道
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
        android: {
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT, // 使用 PCM 16bits 格式
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM, // 使用 PCM 编码器
            sampleRate: 24000, // 设置常用的高质量采样率
            numberOfChannels: 1, // 单声道
            bitRate: 128000,
        },
    };

    const initSocket = async() => {
        if(socket==null && versionInfo?.chat_url != null){
            const SOCKET_URL = versionInfo?.chat_url;
            // const SOCKET_URL = 'ws://192.168.1.122:8080/ws'; // 修改为你的局域网 IP 地址
            const ws = new WebSocket(SOCKET_URL);
            console.log("connect:",SOCKET_URL);
            ws.onopen = () => {
                console.log('WebSocket connected');
                ws.send(JSON.stringify({ type: 'connect' }));
            };
            ws.onmessage = (message) => {
                const content = JSON.parse(message.data);
                if(content?.audio){
                    //setAudioQueue(prevQueue => [...prevQueue, content.audio]);
                    mergedAudioData.current += content.audio; // 合并 PCM 音频数据
                    // 当数据累计达到一定长度后，再放入播放队列
                    if (mergedAudioData.current.length > 8000) { // 根据需要调整缓冲区大小
                        setAudioQueue((prevQueue) => [...prevQueue, mergedAudioData.current]);
                        mergedAudioData.current = ''; // 清空缓存数据
                    }
                } else if(content?.text){
                    console.log("text, play:",content.text);
                    showToast(content.text);
                }else{
                    console.log("other:",content);
                }
            };
            ws.onclose = () => {
                console.log('WebSocket closed');
                setSocket(null);
            };
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            setSocket(ws);
            return () => {
                setSocket(null);
                ws.close();
            };
        }
    };

    useEffect(() => {
        let uid = Date.now().toString();
        if (userInfo != null && userInfo.uid !== null) {
            uid = userInfo.uid;
        }
    }, []);

    const signOut = async () => {
        setUserInfo(null);
        setUserCustomer(null);
        await AsyncStorage.removeItem("@user");
        await AsyncStorage.removeItem("@customer");
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
    };

    const startRecording = async () => {
        if (isRecording) {
            console.warn('A recording is already in progress. Stopping the ongoing recording...');
            await stopRecording();
        }
        try {
            console.log('Requesting permissions..');
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access microphone is required!');
                return;
            }

            console.log('Starting recording..');
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                playThroughEarpieceAndroid: false,
            });
            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(recordingOptions);
            await newRecording.startAsync();
            recording.current = newRecording;
            setIsRecording(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            // If there is an error and the recording is not properly prepared, release it.
            if (recording.current) {
                await recording.current.stopAndUnloadAsync();
                recording.current = null;
            }
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording..');
        if (recording.current) {
            try {
                await recording.current.stopAndUnloadAsync();
                const uri = recording.current.getURI();
                const audioData = await fetchAudioAsBase64(uri);
                socket.send(JSON.stringify({"type":"message", "audio":audioData}));
                console.log("send message: 123");
            } catch (err) {
                console.error('Failed to stop recording', err);
            }finally {
                recording.current = null;
            }
        }
        setIsRecording(false);
    };

    const fetchAudioAsBase64 = async (uri) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleMicPress = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const playAudioQueue2 = async () => {
        if (audioQueue.length === 0 || recording.current != null || isPlaying) {
            setIsPlaying(false);
            return;
        }
        // 合并 audioQueue 中的所有片段为一个 Base64 字符串
        const base64Audio = audioQueue.join('');
        setAudioQueue([]); // 清空队列
        try {
            // 将合并后的 Base64 PCM 数据添加 WAV header
            const pcmDataList = [base64Audio]; // 传入 PCM 数据列表
            const wavBase64Data = addWavHeaderToPcmList(pcmDataList, 1, 2, 24000);
            // 生成临时文件路径
            const audioPath = `${FileSystem.cacheDirectory}${Date.now()}audio.wav`;
            await FileSystem.deleteAsync(audioPath, { idempotent: true }); // 确保路径干净
            // 将 WAV 格式的 Base64 音频写入文件
            await FileSystem.writeAsStringAsync(audioPath, wavBase64Data, { encoding: FileSystem.EncodingType.Base64 });
            const fileInfo = await FileSystem.getInfoAsync(audioPath);
            if (!fileInfo.exists) {
                console.error("Audio file does not exist:", audioPath);
                return;
            }
            // 加载并播放音频
            const sound = soundRef.current;
            await sound.unloadAsync();
            await sound.loadAsync({ uri: audioPath });
            await sound.setVolumeAsync(1.0);
            // 播放并监听播放状态
            setIsPlaying(true);
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    FileSystem.deleteAsync(audioPath, { idempotent: true });
                    setIsPlaying(false);
                }
            });
        } catch (error) {
            console.error('Error during audio playback:', error);
            setIsPlaying(false);
        }
    };
    useEffect(() => {
        if (!isPlaying && audioQueue.length > 0) {
            setIsPlaying(true);
            // 配置播放模式
            Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                playThroughEarpieceAndroid: false, // 播放时使用扬声器
                staysActiveInBackground: true,
            }).then(()=>{
                playAudioQueue2().then();
            });
        }
    }, [audioQueue, isPlaying]);

    function uint8ArrayToBase64(byteArray) {
        let binary = '';
        const len = byteArray.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(byteArray[i]);
        }
        return base64.encode(binary);
    }

    function addWavHeaderToPcmList(base64_pcm_data_list, numChannels = 1, sampleWidth = 2, frameRate = 24000) {
        // 解码 Base64 PCM 数据为二进制
        let pcmData = new Uint8Array();
        base64_pcm_data_list.forEach(base64_pcm => {
            const pcmBuffer = Uint8Array.from(atob(base64_pcm), c => c.charCodeAt(0));
            pcmData = new Uint8Array([...pcmData, ...pcmBuffer]);
        });

        // 计算 WAV 文件头的信息
        const byteRate = frameRate * numChannels * sampleWidth;
        const blockAlign = numChannels * sampleWidth;
        const dataSize = pcmData.length;
        const fileSize = 44 + dataSize - 8;

        // 创建 WAV 文件头
        const header = new Uint8Array(44);
        header.set([82, 73, 70, 70]); // "RIFF"
        header.set([fileSize & 0xff, (fileSize >> 8) & 0xff, (fileSize >> 16) & 0xff, (fileSize >> 24) & 0xff], 4);
        header.set([87, 65, 86, 69], 8); // "WAVE"
        header.set([102, 109, 116, 32], 12); // "fmt "
        header.set([16, 0, 0, 0], 16); // PCM 格式块长度
        header.set([1, 0], 20); // PCM
        header.set([numChannels, 0], 22); // 声道数
        header.set([frameRate & 0xff, (frameRate >> 8) & 0xff, (frameRate >> 16) & 0xff, (frameRate >> 24) & 0xff], 24);
        header.set([byteRate & 0xff, (byteRate >> 8) & 0xff, (byteRate >> 16) & 0xff, (byteRate >> 24) & 0xff], 28);
        header.set([blockAlign, 0], 32);
        header.set([sampleWidth * 8, 0], 34);
        header.set([100, 97, 116, 97], 36); // "data"
        header.set([dataSize & 0xff, (dataSize >> 8) & 0xff, (dataSize >> 16) & 0xff, (dataSize >> 24) & 0xff], 40);

        // 合并 header 和 PCM 数据
        const wavData = new Uint8Array(header.length + pcmData.length);
        wavData.set(header, 0);
        wavData.set(pcmData, header.length);

        // 使用改进后的 Base64 转换方法
        return uint8ArrayToBase64(wavData);
    }


    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.tryButton} onPress={signOut}>
                <Text style={styles.tryButtonText}>SignOut</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>👋 Tell me more about the issue you're facing</Text>
            {/* Animated Bobby */}
            <Animated.View style={[styles.mainCircleContainer, { transform: [{ translateY: bounceValue }] }]}>
                <Image source={require('../assets/smilebobby.jpg')} style={styles.bobbyImage} />
            </Animated.View>
            {/* Microphone Button */}
            {
                socket?(<TouchableOpacity
                    style={[styles.micButton, { backgroundColor: isRecording ? '#FF0000' : '#32CD32' }]}
                    onPress={handleMicPress}
                >
                    <Ionicons name='mic' size={32} color="#ffffff" />
                </TouchableOpacity>):(
                    <TouchableOpacity
                        style={[styles.micButton, { backgroundColor:  '#FFA500' }]}
                        onPress={initSocket}
                    >
                        <Ionicons name='wifi' size={32} color="#ffffff" />
                    </TouchableOpacity>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingTop: 80, backgroundColor: '#f4f2e3' },
    headerText: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#333', textAlign: 'center' },
    mainCircleContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 0 },
    bobbyImage: { width: 350, height: 350, resizeMode: 'contain', marginTop: 100 },
    micButton: { padding: 25, borderRadius: 50, position: 'absolute', bottom: 40 },
    tryButton: {
        position: 'absolute',
        top: 120,
        right: 40,
        backgroundColor: '#123524',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 25,
        alignItems: 'center',
    },
    tryButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'ChalkboardSE-Regular',
    },
});