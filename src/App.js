import Form from './components/builder'
import Config from './assets/config.svg'
import Download from './assets/download.svg'

export const Builder = () => {
  return (
    <div className='-flex -jc-c -col -gap'>
      <div className='-flex jc-start -gap -al-c -jc-c' id='title_segment'>
        <img src={Config}></img>
        <h1>Configuration generator</h1>
      </div>
      <Form />
      <a id='downloadLink' download='config.json'>
        <div className='-flex -jc-c -al-c download -gap'>
        <img className='icon' src={Download}></img>
        Download config.json
        </div>
      </a>
    </div>
  );
}
