import { TENSORFLOW_SERVICE_URL } from '../config/env.js'

// TensorFlow Recommendations
export const getTensorFlowPredictionList = async (userId) => {
    try {
        if (!TENSORFLOW_SERVICE_URL) {
            return []
        }

        const response = await fetch(`${TENSORFLOW_SERVICE_URL}/recommendations/${userId}`)

        if (!response.ok) {
            return []
        }

        const data = await response.json()

        return data.recommendations || []
    } catch (err) {
        return []
    }
}

// TensorFlow Recommendations
export const getTensorFlowRecommendations = async (req, res) => {
    try {
        const recommendations = await getTensorFlowPredictionList(req.user._id)

        res.status(200).json({
            message: recommendations.length > 0 ? "TensorFlow Recommendations" : "TensorFlow service offline",
            payload: recommendations,
            experimental: true
        })
    } catch (err) {
        res.status(200).json({
            message: "TensorFlow service offline",
            payload: [],
            experimental: true
        })
    }
}
