import { auth, storage, database } from '../firebase.js'
import * as $ from 'jquery'
import * as _ from 'underscore'
import { signInAnonymously } from 'firebase/auth'
import { get, ref as dbRef, child } from 'firebase/database'
import { ref, getBlob } from 'firebase/storage'
import { Experiment } from './experiment.js'

export async function getConfig(id) {
    const configRef = ref(storage, `/_configs/${id}_config.json`)
    const req = await getBlob(configRef)
    const res = await req.text()
    return JSON.parse(res)
}

const runner = (exp, ver) => {

    signInAnonymously(auth).then(() => { // authenticate user

        console.log('Authenticated!')

        // get variables
        // TODO: change/add/delete URL variables as needed
        var urlVars = {
            expID: exp,
            verID: ver,
            pID: turkGetParam('p')
        };

        document.title = urlVars.expID

        getConfig(urlVars.expID)
            .then(config => {

            getParticipantCompletion(urlVars.pID, database, config).then(res => {
                // if there is data, and if that data shows participant has already completed
                // any version of the experiment
                if (res.val && res.val.complete == 1) {
                    console.log('This participant has already completed the experiment! :(');
                    showUserError('repeatUser');
                }
                // or if there is no experiment id matching url variable
                else if (!config.versions.includes(urlVars.verID)) {
                    console.log('Invalid experiment ID or paricipant ID');
                    showUserError('invalidExpId');
                }
                // green light
                else {
                    console.log('This participant has not yet completed the experiment. :)');
                    loadStimuliAndRun(config, urlVars, storage, database)
                }
            }).catch((err) => {
                // unable to access database to check participant status
                console.error(err);
                showUserError('fbIssues');
            });
        
        })
    })

}

/* -------------------------------------------------------------------------- */
/*                         EXPERIMENT HELPER FUNCTIONS                        */
/* -------------------------------------------------------------------------- */

/* -------------------------- GETTING URL VARIABLES ------------------------- */

// turkGetParam()
// searches for value of URL variable <name>
// don't worry about this function
const turkGetParam = (name) => {
    name = name.replace(/[[]/, "\[").replace(/[]]/, "\]");
    var regexS = "[?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);

    if (results == null)
        return "";
    return results[1];
}

/* ------------------------------- VALIDATION ------------------------------- */

// getParicipantCompletion()
// returns value at participant in database
var getParticipantCompletion = async (pID, database, stimuli) => {

    if (pID == '') {
        return null 
    }

    try {
        var snapshot = await get(child(dbRef(database), `${stimuli.projectid}/${pID}`))
        console.log('Read successful')
        return {val: snapshot.val(), stimuli: stimuli}
    } catch (err) {
        console.error(err)
    }

}

/* ----------------------------- INITIALIZATION ----------------------------- */

/* loadStimuliAndRun()
 * It's all in the name...
 * 1. Sets references to storage and database for experiment (ie. now we have a 
 * *  reference to a specific participant ID file name in specific experiment ID folder
 * *  that we will write our data into!)
 * 2. Creates new Experiment object and runs it with init()
 */
var loadStimuliAndRun = (stimuli, urlVars, storage, database) => {

        // file named such that {expID}_{pID}.csv will be in folder {expID}
        // TODO: change if you want a different file format or have different URL variables
        var filename = `${urlVars.verID}/${urlVars.verID}_${urlVars.pID}_${auth.currentUser.uid}.csv`;

        // initialize storage and database references
        var storageRef = ref(storage, stimuli.project_id + '/' + filename)
        var stimRef = ref(storage, `_stimuli/${stimuli.files.stimulusFolder}`)
        var databaseRef = dbRef(database, stimuli.project_id + '/' + urlVars.pID)

        // initialize experiment, appending URL variables to your stimuli.json values
        var experiment = new Experiment(_.extend(stimuli, urlVars), storageRef, databaseRef, stimRef);
        experiment.init();
}

/* -------------------------------------------------------------------------- */
/*                               ERROR FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

/* showUserError()
 * injects error text via errorTextGenerator() into html
 * TODO: insert your email into call to errorTextGenerator()
 */ 
var showUserError = (errorType) => {
    var errorText = errorTextGenerator(errorType, 'robbinat@umich.edu') // TODO: YOUR EMAIL HERE
  $( '#jspsych-target' ).append($('<div>', {
     id: 'error',
     class: 'text-center',
     html: errorText
   }));
}
/* errorTextGenerator()
 * takes in errorType string and returns correct text. 
 * Right now, only valid error strings are 'repeatUser', 'invalidExpId', and 'fbIssues' 
 * (fbIssues standing for Firebase Issues)
 * TODO: change or add error as needed
 */
var errorTextGenerator = (errorType, email) => {
    var errorStr = ''
    var contactStr = `you can contact the lab at <a href="mailto:${email}">${email}</a>, and we will do our best to resolve the situation.</div>`
    if (errorType == 'repeatUser') {
        errorStr = '<p>It appears that you have previously completed a study that used the same data as, or similar data to, the study you are attempting to complete now. Unfortunately, we cannot allow the same person to participate in an experiment more than once. We apologize for the inconvenience, but we must ask that you return your HIT now. (This will not negatively impact your ability to participate in future experiments.)</p><p>If you believe that this message is in error, '
    } // if
    else if (errorType == 'invalidExpId') {
        errorStr = '<p>We\'re having trouble loading your experiment. Please make sure that you have not altered the URL given to you in any way. Try loading again with your original link.</p><p>If you believe that this message is in error, '
    } // else if
    else if (errorType == 'fbIssues') {
        errorStr = '<p>We\'re having some trouble getting you connected. Please make sure that you have not altered the URL given to you in any way. Try loading again with your original link.</p><p>If this issue persists, '
    } // else if
    else {
        errorStr = '<p>An unknown error is occuring. Try loading the page again</p><p>If this issue persists, '
    } // else
    return errorStr + contactStr
}

export default runner
