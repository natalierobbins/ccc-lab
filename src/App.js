import Form, { ExpNav } from './components/builder'
import FirebaseUpload from './components/upload'
import AdminEditor from './components/admin.js'
import { Header, Authentication } from './components/ui.js'
import CSVCombine from './components/combine.js'
import NavBody, { navigation } from './components/nav.js'
import JsPsych from './components/jspsych.js'
import 'jspsych/css/jspsych.css'

const Wrapper = ({page}) => {
  return (
    <div className='-flex -jc-c -col -gap'>
      <Header />
      <Authentication body={page} />
    </div>
  )
}

export const LogIn = () => {
  <div className='-flex -jc-c -col -gap'>
    <Header />
    <FirebaseUpload />
  </div>
}

export const Builder = () => {
  return (
    <Wrapper page={<Form />} />
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
    <Wrapper page={<NavBody title='Welcome!' links={navigation} />} />
  )
}

export const Experiment = () => {
  return (
    <JsPsych />
  )
}

export const ExpSelect = () => {
  return (
    <Wrapper page={<ExpNav />} />
  )
}