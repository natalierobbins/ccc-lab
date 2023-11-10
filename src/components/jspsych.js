import runner from '../template/runner.js'
import {useParams} from "react-router-dom"
          

const JsPsych = () => {

    const {id} = useParams()
    const {ver} = useParams()
    runner(id, ver)
    
    return (
        <div id="jspsych-target"><div id="load-text" className="very-large"></div></div>
    )
}

export default JsPsych