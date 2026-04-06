import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, View } from "react-native"
import WebView from "react-native-webview"
import { config } from "../config"
import { useCallback, useEffect, useRef, useState } from "react"
import { useWebViewBack } from "../hooks/useWebViewBack"



const PageRender = ({ url, setTitle }: { url?: string, setTitle?: (title: string) => void }) => {
    const [showLoader, setShowLoader] = useState(true)
    const [pageLoaded, setPageLoaded] = useState(false)
    const webViewRef = useRef<any>(null)
    const { registerBrowserHistory } = useWebViewBack(webViewRef)
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!pageLoaded) return
        if (refreshing) return
        injectCustomCSS()
        hideLoading()

    }, [pageLoaded, refreshing])



    // PAGE LOAD
    const handleLoadStart = (event: any) => {
        showLoading()
    }
    const handleLoadEnd = (event: any) => {
        if (setTitle) {
            setTitle(event.nativeEvent.title)
        }
        setPageLoaded(true)
    }

    const onRefresh = () => {
        setRefreshing(true);
        showLoading()
        webViewRef.current.reload();
    }

    const handleNavigationStateChanges = (navState: any) => {
        showLoading()
        registerBrowserHistory(navState.canGoBack)
    }


    // LOADER
    const hideLoading = () => {
        setTimeout(() => {
            setRefreshing(false)
            setShowLoader(false)
        }, 200)
    }
    function showLoading() {
        setShowLoader(true)
    }



    // Inject custom css
    const customCSS = `
  (function() {
    const style = document.createElement('style');
    style.innerHTML = \`${config.css}\`;
    document.head.appendChild(style);
  })();`;
    const injectCustomCSS = () => webViewRef.current.injectJavaScript(customCSS)



    const [allowRefresh, setAllowRefresh] = useState(true);

    const handleWebviewScroll = useCallback((e: any) => {
        if (!config.enabledPullToRefresh) return;
        const yOffset = e.nativeEvent.contentOffset.y;
        if (yOffset > 0) {
            setAllowRefresh(false);
        } else if (yOffset <= 0) {
            setAllowRefresh(true);
        }
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}
            refreshControl={(config.enabledPullToRefresh) ? <RefreshControl enabled={allowRefresh} refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
        >
            {showLoader && <View style={[styles.loaderContainer, { backgroundColor: config.loaderConfig.loaderBgColor }]}>
                {!refreshing && <ActivityIndicator size={38} color={config.loaderConfig.color} />}
            </View>}
            <WebView
                onScroll={handleWebviewScroll}
                ref={webViewRef}
                javaScriptEnabled={true}
                style={styles.renderSurface}
                source={{ uri: url ?? config.url }}
                onLoadEnd={handleLoadEnd}
                onLoadStart={handleLoadStart}
                onNavigationStateChange={handleNavigationStateChanges}
                onLoadProgress={(e) => { if (e.nativeEvent.progress === 1) hideLoading() }}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    renderSurface: {
        width: Dimensions.get("screen").width,
        flex: 1
    },
    loaderContainer: {
        backgroundColor: 'white',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default PageRender
