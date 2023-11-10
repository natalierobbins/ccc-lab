import Form from './components/builder'
import FirebaseUpload from './components/upload'
import AdminEditor from './components/admin.js'
import { Header } from './components/ui.js'
import CSVCombine from './components/combine.js'
import NavBody from './components/nav.js'
import JsPsych from './components/jspsych.js'
import 'jspsych/css/jspsych.css'

export const LogIn = () => {
  <div className='-flex -jc-c -col -gap'>
    <Header />
    <FirebaseUpload />
  </div>
}

export const Builder = () => {
  return (
    <div className='-flex -jc-c -col -gap'>
      <Header />
      <Form />
    </div>
  );
}

export const Upload = () => {
  return (
    <div className='-flex -jc-c -col -gap'>
      <Header />
      <FirebaseUpload />
    </div>
  )
}

export const Combine = () => {
  return (
    <div className='-flex -jc-c -col -gap'>
      <Header />
      <CSVCombine />
    </div>  
  )
}

export const Admin = () => {
  return (
    <div className='-flex -jc-c -col -gap'>
      <Header />
      <AdminEditor />
    </div>
  )
}

export const Nav = () => {
  return (
    <div className='-flex -jc-c -col -gap'>
      <Header />
      <NavBody />
    </div>
  )
}

export const Experiment = () => {
  return (
    <JsPsych />
  )
}