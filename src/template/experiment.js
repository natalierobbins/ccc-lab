// experiment.js

// This file defines the Experiment class that is initialized in runner.js.
// The experiment's timeline and trials live here.

// Stimuli are defined in data/stimuli.json. This file is loaded by runner.js.
// The contents of this file are passed to the params variable of the
// Experiment object.

import { uploadBytes, ref, getBlob } from 'firebase/storage'
import { set } from 'firebase/database';
import { initJsPsych } from 'jspsych'
import jsPsychPreload from '@jspsych/plugin-preload';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychSurveyLikert from '@jspsych/plugin-survey-likert';
import $ from 'jquery'

export class Experiment {
    constructor(params, firebaseStorage, firebaseDatabase, stimRef) {

        /* -------------------------------------------------------------------------- */
        /*                               EXPERIMENT DATA                              */
        /* -------------------------------------------------------------------------- */

        // TODO: Add more participant parameters here if needed.
        this.participant = {
            id: params.pID // accessing participant ID from params
        }

        // TODO: Add more experiment parameters here if needed.
        this.experimentData = {
            id: params.expID // accessing experiment ID from params
        }

        this.version = {
            id: params.verID // accessing experiment ID from params
        }
         // Optional -- I store columns and their indices into my stimuli.json file for
         // clearer, cleaner code. You can see me use this in the initTrials() function
        this.columns = params.columns

        // Initialize the experiment timeline
        this.timeline = [];

        /* -------------------------------------------------------------------------- */
        /*                                   GETTERS                                  */
        /* -------------------------------------------------------------------------- */

        // Return current participant's ID
        this.pID = () => { 
            return this.participant.id;
        }
        // Return experiment's ID
        this.expID = () => {  
            return this.experimentData.id;
        }

        this.verID = () => {  
            return this.version.id;
        }

        /* -------------------------------------------------------------------------- */
        /*                                   SETTERS                                  */
        /* -------------------------------------------------------------------------- */

        // push jsPsych block to timeline
        var add = (item) => {
            this.timeline.push(item);
        }

        // use this to add any retroactive properties to final data output
        // for example, this setting will add a new "participantId" column 
        // to the final .csv file with the correct ID
        this.addProperties = (jsPsych) => {
            jsPsych.data.addProperties({
                participantId: this.pID()
            });
        }

        /* -------------------------------------------------------------------------- */
        /*                             FIREBASE FUNCTIONS                             */
        /* -------------------------------------------------------------------------- */

        /* addParticipantToDatabase()
         * Checks if real participant or demo
         *
         * This format saves participants by ID, and under each participant ID
         * are two attributes, "complete" and "experiment"
         *
         * TODO: Edit if you want a different format, and add any extra information you want
         * about your participants in the second parameter of the set() function
         */
        var addParticipantToDatabase = () => {
            // check if demo
            if (this.pID() != 'demo') {
                try {
                    // set an instance of this participant with these values
                    set(firebaseDatabase, {
                        complete: 1,
                        experiment: this.verID()
                    });
                    console.log('Added participant to database');
                }
                // if issue with adding participant
                catch (err) {
                    console.error(err);
                }
            }
        }

        /* saveDataToStorage()
         *
         * Initializes new File object with csv-formatted filedata and uploads it to firebase storage
         *
         * Does not save any data from demo trials :)
         */
        var saveDataToStorage = (filedata) => {
            // check if demo
            if (this.pID() != 'demo') {
                console.log('Saving progress...');
                // initialize new file -- if you need help with this (ex. need to change file format), lookup Javascript's File API
                var file = new File([filedata], firebaseStorage._location.path, {type: 'text/csv'})
                try {
                    uploadBytes(firebaseStorage, file).then((snapshot) => {
                        console.log('Upload .csv file');
                    });
                }
                // if issue with uploading csv file
                catch (err) {
                    console.error(err)
                }
            }
            // demo complete, no need to upload file!
            else {
                console.log('Demo complete!')
            }
        }

        /* -------------------------------------------------------------------------- */
        /*                               EXPERIMENT FLOW                              */
        /* -------------------------------------------------------------------------- */
        
        /* Function to be called by jsPsych at the very end of the experiment
         * If you are using Prolific, you should use this function to redirect
         * participants to the page Prolific specifies. */
        this.onFinish = function () {
            console.log('finish')
            // TODO: Add Prolific or other redirects here
        }

        /* ----------------------------- PRE-EXPERIMENT ----------------------------- */

        // Use this function to create any trials that should appear before the main
        // experiment. For example:
        this.initPreExperiment = () => {

            // preload plugin from jsPsych. useful especially for audio and image stimuli
            var preload = {
                type: jsPsychPreload,
                auto_preload: true,
                on_finish: function(data) {
                    delete data.success
                    delete data.timeout
                    delete data.failed_images
                    delete data.failed_audio
                    delete data.failed_video
                    params.output.forEach(item => {
                        data[item] = 'NA'
                    })
                }
            };
            
            // welcome page
            var welcome = {
                type: jsPsychHtmlButtonResponse,
                stimulus: params.instructions['instructions-0'],
                choices: ['Continue'],
                // this on_finish function will replace the current stimulus, which is
                // a long, ugly HTML string, with 'WELCOME_MESSAGE' on your final data output
                on_finish: function(data) {
                    data.stimulus = 'WELCOME_MESSAGE'
                    params.output.forEach(item => {
                        data[item] = 'NA'
                    })
                }
            };

            // instructions page
            var instructions = {
                type: jsPsychHtmlButtonResponse,
                stimulus: params.instructions['instructions-1'],
                choices: ['Continue'],
                on_finish: function(data) {
                    data.stimulus = 'INSTRUCTIONS_MESSAGE'
                    params.output.forEach(item => {
                        data[item] = 'NA'
                    })
                }
            };

            // push all blocks to timeline
            add(preload);
            add(welcome);
            add(instructions);

        };

        /* --------------------------------- TRIALS --------------------------------- */

        /* initTrial()
         * Use this function if you have repetitive stimuli that take the same form.
         * This can also be useful if you want to initialize your trials in different
         * ways based on different conditions
         */ 
        var initTrial = (exp, stimulus) => {
            return {
                type: jsPsychSurveyLikert,
                questions: [
                    {
                        prompt: params.promptcontent,
                        labels: params.options
                    }
                ],
                scale_width: 500,
                on_start: async function() {
                    $('#countdown').text('')
                    console.log('hello')
                    $('.jspsych-content-wrapper').css('visibility', 'hidden')
                    var req = ref(stimRef, `${stimulus[params.cols[params.files.stimulusContent]]}`)
                    const res = await getBlob(req)
                    var audio_src = URL.createObjectURL(res)
                    var audio = new Audio(audio_src)
                    audio.addEventListener('ended', (e) => {
                        $('.jspsych-content-wrapper').css('visibility', 'visible')
                    })
                    audio.play()
                },
                // here is an example of an on_finish function that checks if a
                // participant response is correct or not and creates a new 
                // "correct" column in the CSV with boolean value accordingly
                // TODO: change or remove as needed
                on_finish: function(data) {
                    delete data.question_order
                    params.output.forEach(item => {
                        data[item] = stimulus[params.cols[item]]
                    })
                    if (data.response['Q0']) {
                        data.response = data.response['Q0'] + 1
                    }
                    else {
                        data.response = 'NA'
                    }
                    console.log(data)
                }
            }
        }

        var initCountdown = (len) => {
            var remaining = len / 1000
            $('#countdown').text(`Break started. Time remaining: ${remaining}`)
            remaining -= 1
            var countdown = setInterval(() => {
                if (remaining <= 1) {
                    clearInterval(countdown)
                }
                $('#countdown').text(`Break started. Time remaining: ${remaining}`)
                remaining -= 1
            }, 1000)
        }

         /* initTrials()
          * Assuming that all of your stimuli are relatively uniform, you can init all
          * of them with one for loop. If not, use this function to initialize your trials
          * individually.
          * In this function, the <stimuli> variable should be one single list, with each
          * item being a single stimulus (likely also a list)
          * So, in the example below, we are accessing the stimuli list at i's text column
          */ 
        this.initTrials = (exp, stimuli, breaks) => {
            for (let i = 0; i < stimuli.length; i++) {
                var trial = initTrial(exp, stimuli[i]);

                var block_size = stimuli.length / (breaks.num_breaks + 1)

                if ((i + 1) % block_size == 0 && (i + 1) != stimuli.length) {
                    trial['post_trial_gap'] = breaks.len_breaks
                    trial['on_finish'] = function(data) {
                        trial['on_finish'](data)
                        initCountdown(breaks.len_breaks)
                    }
                }
                // push to timeline
                add(trial);
            } // for i
        }

        /* ----------------------------- POST-EXPERIMENT ---------------------------- */

        /* initPostExperiment()
         * 1. Converts data gathered by jsPsych into a csv-formatted string
         * *  and saves it to storage using savaDataStorage() from experiment.js
         * 2. Saves paricipant ID to database using addParticipantToDatabase()
         * *  from experiment.js
         * 3. Defines final message for user
         * 4. Pushes entire block to experiment timeline
         */
        this.initPostExperiment = (jsPsych) => {
            var thankYou = {
                type: jsPsychHtmlKeyboardResponse,
                stimulus:  params.exit['exit-0'],
                // this function will run at beginning of this block to save participant
                // and data to Firebase
                on_start: function() {
                    saveDataToStorage(jsPsych.data.get().csv())
                    addParticipantToDatabase();
                }
            }
            // push to timeline
            add(thankYou);
            
        }

        // init()
        // putting it all together! this is the only function from the Experiment
        // class that we actually call in firebase.js
        this.init = () => {
            console.log(firebaseStorage._location.path)

            // push pre experiment
            this.initPreExperiment();
            // push experiment trials -- in this case, expID is the same as the name of
            // each list, so we can access our given stimuli list this way
            console.log('!!!', this.expID())


            this.initTrials(this.expID(), params.stimuli[this.verID()], params.breaks);

            // initialize your jsPsych object
            var jsPsych = initJsPsych({
                show_progress_bar: true,
                display_element: 'jspsych-target',
                on_finish: this.onFinish
            });
            // adding properties, like participant ID
            this.addProperties(jsPsych);

            // push post experiment; this needs to be done after creating our jsPsych object,
            // since this function must take it in as an argument
            this.initPostExperiment(jsPsych)

            // jsPsych object is ready; run it on the timeline we created
            jsPsych.run(this.timeline);
        }
    }
}