import { Configuration, OpenAIApi } from "openai"
const openAIKey = import.meta.env.VITE_OPENAI_API_KEY
const configuration = new Configuration({
    apiKey: openAIKey,
})
const openai = new OpenAIApi(configuration)

export default openai
