
import buildConfig from "../builds/buildConfig.json";

interface LoaderConfig {
    useLoader: boolean,
    strategy: 'initial' | 'every-navigation',
    color: string,
    loaderBgColor: string
}

type NavigationType = "default" | "bottom-tab";

interface Navigation {
    label: string,
    url: string,
    icon: string,
}

interface NavigationConfig {
    type: NavigationType,
    showAppbar: boolean,
    showPageTitle: boolean,
    navigations: Navigation[],
}

interface RenderConfig {
    url: string,
    primaryColor: string,
    loaderConfig: LoaderConfig,
    css: string | undefined,
    enabledPullToRefresh: boolean | undefined
    navigationConfig: NavigationConfig
}



const parseIntoRenderConfig = (config: any): RenderConfig => {
    return {
        url: config?.url ?? "https://google.com",
        primaryColor: config?.primaryColor ?? "#45be4c",
        loaderConfig: {
            color: config?.loaderConfig?.color ?? "#45be4c",
            loaderBgColor: config?.loaderConfig?.loaderBgColor ?? "white",
            strategy: config?.loaderConfig?.strategy ?? "initial",
            useLoader: config?.loaderConfig?.useLoader ?? false,
        },
        css: config?.css ?? "",
        enabledPullToRefresh: config?.enabledPullToRefresh ?? false,
        navigationConfig: {
            showPageTitle: config?.navigationConfig?.showPageTitle ?? false,
            showAppbar: config?.navigationConfig?.showAppbar ?? false,
            type: config?.navigationConfig?.navigationType ?? "default",
            navigations: config?.navigationConfig?.navigations ?? [],
        }
    };
};



export const config = parseIntoRenderConfig(buildConfig);


