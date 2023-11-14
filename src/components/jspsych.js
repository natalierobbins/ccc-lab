import runner from '../template/runner.js'
import {useParams} from "react-router-dom"
          

const JsPsych = () => {

    const {id} = useParams()
    const {ver} = useParams()
    runner(id, ver)
    
    return (
        <div id='target-wrapper'>
            <div id="jspsych-target">
                <div id="load-text" className="very-large"></div>
            </div>
            <br></br>
            <br></br>
            <div id='countdown'>
            </div>
        </div>
    )
}

export default JsPsych