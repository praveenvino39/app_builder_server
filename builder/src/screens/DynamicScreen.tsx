import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PageRender from "../component/PageRender"
import { RootStackParamList } from "../../App";
import { RouteProp, useRoute } from "@react-navigation/native";



const DynamicScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'DynamicScreen'>>()
    const { url } = route.params
    return (
        <PageRender url={url} />
    )
}

export default DynamicScreen