import { useNavigation } from "@react-navigation/native"
import PageRender from "../component/PageRender"
import { config } from "../config";

const NavigationEnabledScreen = ({ url }: any) => {
    const navigation = useNavigation();

    const handleSetTitle = (title: string) => {
        if (config.navigationConfig.showPageTitle) {
            navigation.setOptions({ headerTitle: title });
        }
    }

    return (
        <PageRender url={url} setTitle={handleSetTitle} />
    )
}

export default NavigationEnabledScreen