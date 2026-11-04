import StatusBar from "@/components/base/statusBar";
import globalStyle from "@/constants/globalStyle";
import useOrientation from "@/hooks/useOrientation";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Background from "./components/background";
import Bottom from "./components/bottom";
import Content from "./components/content";
import Lyric from "./components/content/lyric";
import NavBar from "./components/navBar";
import Config from "@/core/appConfig";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { usePlayList } from "@/core/trackPlayer"; 

export default function MusicDetail() {
    const orientation = useOrientation();
    const [uiVisible, setUiVisible] = useState(false);
    const timeoutRef = useRef(null);
    const playList = usePlayList();

    const handleScreenTap = () => {
        if (uiVisible) {
            setUiVisible(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else {
            setUiVisible(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setUiVisible(false), 5000);
        }
    };

    useEffect(() => {
        const needAwake = Config.getConfig("basic.musicDetailAwake");
        if (needAwake) {
            activateKeepAwakeAsync();
        }
        return () => {
            if (needAwake) {
                deactivateKeepAwake();
            }
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const tapGesture = Gesture.Tap()
        .runOnJS(true)
        .onEnd(() => {
            handleScreenTap();
        });

    const panGesture = Gesture.Pan()
        .runOnJS(true)
        .onEnd((event) => {
            try {
                if (event.translationY < -50) {
                    playList?.playNext();
                } else if (event.translationY > 50) {
                    playList?.playPrev();
                }
            } catch (e) {}
        });

    const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

    return (
        <>
            <Background />
            <SafeAreaView style={globalStyle.fwflex1}>
                <StatusBar backgroundColor={"transparent"} />
                <GestureDetector gesture={composedGesture}>
                    <View style={style.bodyWrapper} collapsable={false}>
                        <View style={globalStyle.flex1}>
                            {uiVisible && <NavBar />}
                            <Content />
                            {uiVisible && <Bottom />}
                        </View>
                        {orientation === "horizontal" ? (
                            <View style={globalStyle.flex1}>
                                <Lyric />
                            </View>
                        ) : null}
                    </View>
                </GestureDetector>
            </SafeAreaView>
        </>
    );
}

const style = StyleSheet.create({
    bodyWrapper: {
        width: "100%",
        flex: 1,
        flexDirection: "row",
    },
});


