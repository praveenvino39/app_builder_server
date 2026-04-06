import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PageRender from "../component/PageRender"
import { config } from "../config";



const IntialScreen = () => {
    return (
        <PageRender url={config.url} />
    )
}

export default IntialScreen