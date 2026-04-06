import { useEffect, useState } from "react"
import { BackHandler } from "react-native";

export const useWebViewBack = (webViewRef: any) => {
    const [canGoBack, setCanGoBack] = useState(false);

    useEffect(() => {
        const onBackPress = () => {
            if (canGoBack && webViewRef?.current) {
                webViewRef.current.goBack();
                return true; // prevent app exit
            }
            return false; // allow default behavior (exit app)
        };

        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => subscription.remove();
    }, [canGoBack]);

    const registerBrowserHistory = (_canGoBack: boolean) => {
        setCanGoBack(_canGoBack)
    }

    return { registerBrowserHistory }

}