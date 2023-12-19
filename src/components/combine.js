import { Title } from './ui'
import * as _ from 'lodash'
import * as $ from 'jquery'

const CSVCombine = () => {

    const uploadHandler = (e) => {
        $('#downloadLink').css('display', 'none')
        const files = e.target.files
        var result = []
        var ctr = 0
        
        var req = new Promise((resolve, reject) => {
            Object.keys(files).forEach(idx => { 
                var reader = new FileReader()
                reader.readAsText(files[idx])
    
                reader.addEventListener('load', () => {
                    var content = reader.result.split('\r\n')
                    content = content.map(row => { 
                        var splitRow = row.split(',')
                        var cleanRow = splitRow.map((col) => { return col.replace(/"/g, '')})
                        return cleanRow
                    })
                    content.slice(0, -1).forEach((row) => {
                        result.push(row)
                    })
                    if (ctr++ == files.length - 1) {
                        resolve()
                    }
                })

            });
        })
        req.then(() => {
            const cols = result[0]
            result = result.filter((item) => !_.isEmpty(_.xor(item, cols)))
            result = [cols, ...result]



            var csv = result.map((row) => {
                return row.join(',')
            })
            csv = csv.join('\n')

            const blob = new Blob([csv], {type: 'text/csv'});
            
            const url = window.URL.createObjectURL(blob)
            
            $('#downloadLink').css('display', 'flex')
            $('#downloadLink').attr('download', 'result.csv')
            $('#downloadLink').attr('href', url)

        })
        
    }

    return (
        <div className='-flex -col -gap -jc-c -al-c'>
            {/* <Title src={Filter} txt='CSV Combiner' /> */}
            <div className='-flex -col form-wrapper'>
                <h3>Upload</h3>
                <p>The resulting .csv file will aggregate every .csv file in the folder(s) you upload.</p><p>You may only upload one folder at a time, but any subfolders will be combined automatically for you.</p>
                <div className='-flex -col label-input-wrapper -jc-c -full-width'>
                    <input 
                        name='files'
                        id="files" 
                        type='file'
                        multiple=''
                        directory=''
                        webkitdirectory='' 
                        mozdirectory=''
                        onChange={(e) => uploadHandler(e)}>
                    </input>
                </div>
                <a id='downloadLink'>
                    <div className='-flex -jc-c -al-c download -gap'>
                        {/* <img className='icon' src={Download}></img> */}
                        Download result.csv
                    </div>
                </a>
            </div>
        </div>
    ) 
}

export default CSVCombine