import { uploadBytes, ref } from 'firebase/storage'
import { storage } from '../firebase.js'
import 'firebaseui/dist/firebaseui.css'
import * as $ from 'jquery'
import { Title, Authentication } from './ui.js'

const FirebaseUpload = () => {
    return <Authentication body={<UploadBody />} />
}

const UploadBody = () => {

    const submit = (e) => {
        e.preventDefault();

        try {
            const regex = /^(.*)\_config\.json$/;
            const match = regex.exec($('#config')[0].files[0].name);

            const configRef = ref(storage, `/_configs/${match[1]}.json`)
            uploadBytes(configRef, $('#config')[0].files[0]).then((snapshot) => {
                $('button').text('Upload successful')
                console.log('Upload successful')
            })
        }
        catch {
            console.log('file wrong')
        }
    }

    return (
        <div className='-flex -col -gap -jc-c -al-c'>
            {/* <Title src={FBUpload} txt='Firebase upload (CCC Lab)' /> */}
            <form id='main' className="-flex -jc-c -col">
                <div className=' -flex -col form-wrapper'>
                    <h3>upload config.json</h3>
                    <div className="-flex -col label-input-wrapper -jc-c -full-width">
                        <input 
                            name="config" 
                            id="config" 
                            type='file'
                            accept='.json'>
                        </input>
                    </div>
                    <button onClick={(e) => submit(e)} className='-flex -jc-c -al-c upload -gap'>
                        Upload
                    </button>
                </div>
            </form>
        </div>
    )
}

export default FirebaseUpload