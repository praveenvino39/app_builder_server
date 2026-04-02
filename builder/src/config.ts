interface LoaderConfig {
    useLoader: boolean,
    strategy: 'initial' | 'every-navigation',
    color: string,
    loaderBgColor: string
}

interface RenderConfig {
    url: string,
    loaderConfig: LoaderConfig,
    css: string | undefined,
    enabledPullToRefresh: boolean | undefined
}

export const config: RenderConfig = {
    "url": "https://store.pvapps.space/",
    "loaderConfig": {
        "useLoader": true,
        "strategy": "initial",
        "color": "#45be4c",
        "loaderBgColor": "white"
    },
    "css": "",
    "enabledPullToRefresh": true
};
