import { useState } from 'react';
import Trash from '../assets/trash.svg'
import Doc from '../assets/document.svg'
import Star from '../assets/star.svg'
import * as $ from 'jquery'

const responseType = {
    'likert': {
        type: 'survey-likert',
        choices: 'labels',
    },
    'multi-choice': {
        type: 'survey-multi-choice',
        choices: 'options'
    },
    'multi-select': {
        type: 'survey-multi-select',
        choices: 'options'
    },
    'text': {
        type: 'survey-text',
        choices: null
    },
    'button': {
        'text': {
            type: 'html-button-response',
            choices: 'choices'
        },
        'audio': {
            type: 'audio-button-response',
            choices: 'choices'
        },
        'image': {
            type: 'image-button-response',
            choices: 'choices'
        },
    },
    'keyboard': {
        'text': {
            type: 'html-keyboard-response',
            choices: 'choices'
        },
        'audio': {
            type: 'audio-keyboard-response',
            choices: 'choices'
        },
        'image': {
            type: 'image-keyboard-response',
            choices: 'choices'
        },
    },
    'slider': {
        'text': {
            type: 'html-slider-response',
            choices: 'labels'
        },
        'audio': {
            type: 'audio-slider-response',
            choices: 'labels'
        },
        'image': {
            type: 'image-slider-response',
            choices: 'labels'
        },
    },
}

$(document).ready(function() {
    $('#stimtype').change(function(e) {
        $("label[for='filenames']").text(`Select column containing ${e.target.value.toLowerCase()} stimuli`)
    })
    
    $('#stimuli').change(function(e) {

        const csv = e.target.files[0]
        var reader = new FileReader()
        reader.readAsText(csv)
        $('#downloadLink').css('display', 'none')
        reader.addEventListener('load', () => {
            $('#output_data').empty()
            $('#column').empty()
            $('#sort').empty()
            $('#filenames').empty()
            $('#filenames').append('<option value="__NONE">Not applicable</option>')
            const colsObject = {}
            const content = reader.result.split('\r')
            const cols = content[0].split(',')
            for (const col in cols) {
                $('#column').append(`<option value="${cols[col]}">${cols[col]}</option>`)
                $('#sort').append(`<option value="${cols[col]}">${cols[col]}</option>`)
                $('#filenames').append(`<option value="${cols[col]}">${cols[col]}</option>`)
                //$('#output_data').append(`<div class='-flex jc-start al-c><label for=${cols[col]}>${cols[col]}</label><input id="${cols[col]}" name="${cols[col]}" defaultValue=${false} type="checkbox"></input></div>`)
                $('#output_data').append(`
                <div>
                    <input id="output-${col}" class="output" value="${cols[col]}" type='checkbox'></input>
                    <label for="output-${col}">${cols[col]}</label>
                </div>
                `)
                colsObject[cols[col]] = col
            }
            $('input[type=checkbox]').change(() => {
                $(this).prop('checked', !$(this).prop('checked'))
                console.log($(this).prop('checked'))
            })
            $('#cols').val(JSON.stringify(colsObject))
        })
    })

    $('form').on('submit', function(e) {
        e.preventDefault()
        $('#downloadLink').css('display', 'none')
        console.log(e)
        const json = {}
        const csv = e.target[0].files[0]
        var reader = new FileReader()
        reader.readAsText(csv)
        reader.addEventListener('load', () => {
            const content = reader.result.split('\r\n')
            const parsed = []
            for (const row in content) {
                parsed.push(content[row].split(','))
            }
            const splitby = cols[col]
            const sortby = cols[sort]
            const versions = {}
    
            parsed.slice(1).map(row => {
                const val = row[splitby]
                var newItem = ""
                var newRow = []
                for (let i = 0; i < row.length; i++) {
                    if (row[i][0] == '"') {
                        newItem += row[i]
                        var k = i
                        for (let j = i + 1; k < row.length; j++) {
                            newItem += row[j]
                            k = j
                            if (row[j].charAt(row[j].length - 1) == '"') {
                                break;
                            }
                        }
    
                        if (newItem.charAt(newItem.length - 1) != '"') {
                            newItem = null;
                        }
    
                        if (newItem) {
                            newRow.push(newItem)
                            i = k;
                        }
                        else {
                            newRow.push(row[i])
                        }
                    }
                    else {
                        newRow.push(row[i])
                    }
                }
                if (Object.keys(versions).includes(val)) {
                    versions[val].push(newRow)
                }
                else {
                    versions[val] = [newRow]
                }
            })
    
            Object.keys(versions).map(key => {
                versions[key] = versions[key].sort((a, b) => {
                    if (a[sortby] < b[sortby]) { return -1 }
                    else if (a[sortby] > b[sortby]) { return 1 }
                    else { return 0 }
                })
            })

            data.forEach(item => {
                if (item[0] != 'filenames' && item[0] != 'cols' && item[0] !='stimuli') {
                    json[item[0]] = item[1]
                }
                else if (item[0] == 'filenames') {
                    json['files'] = {
                        type: json['stimtype'],
                        stimulusContent: item[1] == '__NONE' ? null : item[1]
                    }
                }
                else if (item[0] == 'cols') {
                    json[item[0]] = JSON.parse(item[1])
                }
            })

            json['instructions'] = {}
            $('.instructions').map((idx, item) => {
                console.log(item.value, idx)
                json['instructions']['instructions-' + idx] = item.value
            })

            json['options'] = []
            $('.options').map((idx, item) => {
                json['options'].push(item.value)
            })

            json['exit'] = {}
            $('.exit').map((idx, item) => {
                json['exit']['exit-' + idx] = item.value
            })

            json['output'] = []
            $('.output').map((idx, item) => {
                if ($(item).prop('checked')) {
                    json['output'].push(item.value)
                }
            })

            json['plugin'] = responseType[json['responsetype']][json['stimtype'].toLowerCase()] != undefined ? responseType[json['responsetype']][json['stimtype'].toLowerCase()] : responseType[json['responsetype']]
            json["stimuli"] = versions
            json['versions'] = Object.keys(json['stimuli'])
            
            $('#downloadLink').css('display', 'flex')
            $('#downloadLink').attr("href", `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(json, null, 2))}`)
            console.log(json)
    
        })
        const cols = JSON.parse(e.target[1].value)
        const col = e.target[2].value
        const sort = e.target[3].value

        var data = new FormData(e.target)
        data = [... data.entries()]
    })
})

const Form = () => {

    const [instructions, setInstructions] = useState([{idx: 1, content: ""}, {idx: 2, content: ""}])
    // console.log(instructions)

    const editContent = (i, e) => {
        let newInstructions = [...instructions]
        newInstructions[i - 1].content = e.target.value
        setInstructions(newInstructions)
    }

    const removeInstructions = (i, e) => {
        let newInstructions = instructions.filter(item => item.idx != i)
        let idx = 1
        newInstructions.map(item => {
            $(`#instructions-${idx}`).val(item.content)
            item.idx = idx++
        })
        setInstructions(newInstructions)
    }

    const addInstructions = () => {
        let newInstructions = [...instructions]
        newInstructions.length ? newInstructions.push({idx: newInstructions.at(-1).idx + 1, content: ""}) : newInstructions.push({idx: 1, content: ""})
        setInstructions(newInstructions)
    }

    const [outros, setOutros] = useState([{idx: 1, content: ""}])
    console.log(outros)
    // console.log(instructions)

    const setOutro = (i, e) => {
        let newOutros = [...outros]
        console.log(i)

        newOutros[i - 1].content = e.target.value
        setOutros(newOutros)
    }

    const removeOutro = (i, e) => {
        let newOutros = outros.filter(item => item.idx != i)
        let idx = 1
        newOutros.map(item => {
            $(`#exit-${idx}`).val(item.content)
            item.idx = idx++
        })
        setOutros(newOutros)
    }

    const addOutro = () => {
        let newOutros = [...outros]
        newOutros.length ? newOutros.push({idx: newOutros.at(-1).idx + 1, content: ""}) : newOutros.push({idx: 1, content: ""})
        setOutros(newOutros)
    }

    return (
        <form id='main' className="-flex -jc-c -col">
            <div className=' -flex -col form-wrapper'>
                <h3>add stimuli data</h3>
                <div className="-flex -col label-input-wrapper -jc-start -full-width">
                    <label htmlFor="stimuli">Upload .csv file</label>
                    <input 
                        id="stimuli" 
                        name="stimuli" 
                        type="file" 
                        accept="text/csv">
                    </input>
                </div>
                <input
                    type="hidden"
                    id="cols"
                    name="cols">
                </input>
                <h3>DATA SETTINGS</h3>
                <p>If you do not have a sort-by column, choosing the same separate-by column will preserve the order on your spreadsheet.</p>
                <ExpSettings />
                <h3>INSTRUCTIONS SETTINGS</h3>
                <p>The following message(s) will display before the experiment begins.</p>
                <p style={{marginBottom: '-15px'}}>Please wrap each separate paragraph with &lt;p&gt;&lt;/p&gt; tags. Ex:</p>
                <p style={{marginBottom: '-15px'}}>&lt;p&gt;Here is one paragraph&lt;/p&gt;</p>
                <p >&lt;p&gt;Here is another paragraph&lt;/p&gt;</p>
                <div className='-flex -col -jc-start -full-width -gap' id='instructions_block'>
                {instructions.map(item => {
                    return (
                        <TextBlock type='instructions' key={item.idx} i={item.idx} edit={e => editContent(item.idx, e)} delete={e => removeInstructions(item.idx, e)} />
                    )
                })}
                <div className='add icon-wrapper -full-width -flex -jc-c -al-c' onClick={addInstructions}>
                    <img className='icon' src={Doc}></img>
                    <p>Add</p>
                </div>
                </div>
                <h3>trial settings</h3>
                <TrialBlock />
                <h3>Exit message settings</h3>
                <p>The following message(s) will be displayed after all trials are complete</p>
                {outros.map(item => {
                    return (
                        <TextBlock type='exit' key={item.idx} i={item.idx} edit={e => setOutro(item.idx, e)} delete={e => removeOutro(item.idx, e)} />
                    )
                })}
                <div className='add icon-wrapper -full-width -flex -jc-c -al-c' onClick={addOutro}>
                    <img className='icon' src={Doc}></img>
                    <p>Add</p>
                </div>
                <h3>Output settings</h3>
                <p>Select any columns you'd like preserved in the output data</p>
                <div className="-flex -col label-input-wrapper -jc-start -full-width" id='output_data'>
                    
                </div>
                
                <div className='-flex generate -gap -jc-c -al-c' onClick={e => $('#main').submit()}>
                    <img className='icon' src={Star}></img>
                    Generate config.json
                </div>
            </div>
        </form>
    )
}

const TextBlock = (props) => {
    return (
        <div className="-flex -col label-input-wrapper -jc-c -full-width">
            <label htmlFor={`${props.type}-${props.i}`} style={{textTransform: 'capitalize'}}>{props.type + ' ' + props.i}</label>
            <div className="-flex -jc-c instructions-wrapper -al-c">
                <textarea form='main' onChange={props.edit} className={props.type} id={`${props.type}-${props.i}`}></textarea>
                <div className='icon-wrapper' onClick={props.delete}>
                    <img src={Trash} className='icon'></img>
                </div>
            </div>
        </div>
    )
}

const TrialBlock = (props) => {


    const [options, setOptions] = useState([])
    console.log(options)
    const [type, setType] = useState('likert')

    console.log(type)

    const handleType = (e) => {
        setType(e.target.value)
        if (e.target.value == 'text') {
            setOptions(null)
        }
        else if (!options) {
            setOptions([])
        }
    }

    const editOptions = (i, e) => {
        let newOptions = options
        newOptions[i - 1].content = e.target.value
        setOptions(newOptions)
    }

    const removeOptions = (i, e) => {
        let newOptions = options.filter(item => item.idx != i)
        let idx = 1
        newOptions.map(item => {
            $(`#options-${idx}`).val(item.content)
            item.idx = idx++
        })
        setOptions(newOptions)
    }

    const addOptions = () => {
        let newOptions = [...options]
        newOptions.length ? newOptions.push({idx: newOptions.at(-1).idx + 1, content: ""}) : newOptions.push({idx: 1, content: ""})
        setOptions(newOptions)
    }

    // if slider, choices = labels


    return (
        <div className='-flex -col label-input-wrapper'>
            <label htmlFor='responsetype'>Select response type</label>
            <select id='responsetype' name='responsetype' className='-full-width' onChange={e => handleType(e)}>
                {Object.keys(responseType).map(key => {
                    return ( 
                        <option id={key} key={key} value={key}>{key[0].toUpperCase() + key.slice(1)}</option>
                    )
                })}
            </select>
            <label htmlFor='promptcontent'>Enter prompt</label>
            <input type='text' placeholder='Ex: "Rate the follwing sentence:"' id='promptcontent' name='promptcontent'></input>
            <label htmlFor='promptcontent'>Enter post-trial gap (in ms)</label>
            <input type='number' defaultValue={0} id='trialgap' name='trialgap'></input>
            {options && <label>Add options</label>}
            {options && options.map(option => {
                return (
                <div key={option.idx} className='-flex -al-c label-input-wrapper option-wrapper -jc-c'>
                    <input id={`options-${option.idx}`} form='main' className='options' type='text' onChange={e => editOptions(option.idx, e)}></input>
                    <div onClick={e => removeOptions(option.idx, e)} className='icon-wrapper'>
                        <img className='icon' src={Trash}></img>
                    </div>
                </div>
                )
            })}
            {options && (
                <div onClick={addOptions} className='icon-wrapper -flex -jc-c -al-c add'>
                    <img src={Doc} className='icon' id='option_add'></img>
                    <p>Add</p>
                </div>
            )}
        </div>
    )
}

const ExpSettings = () => {

    const settings = [
        {
            name: 'column',
            prompt: 'Select column to separate by (List, Version, etc)'
        },
        {
            name: 'sort',
            prompt: 'Select column to sort by (Order, Position, etc)'
        },
        {
            name: 'stimtype',
            prompt: 'Select stimulus type',
            options: [
                {value: 'text', content: 'Text'}, 
                {value: 'audio', content: 'Audio'}, 
                {value: 'image', content: 'Image'}
            ]
        },
        {
            name: 'filenames',
            prompt: 'Select column containing text stimuli',
            options: [
                {value: '__NONE', content: 'Not applicable'}
            ]
        }
    ]

    return (
        <div className='label-input-wrapper -flex -col'>
            {settings.map(item => {
                return (
                    <div key={item.name} className='settings-input-wrapper -flex -col'>
                        <label htmlFor={item.name}>{item.prompt}</label>
                        <select id={item.name} name={item.name}>
                            {item.options && item.options.map(option => {
                               return( <option id={option.value} key={option.value}>{option.content}</option> )
                            })}
                        </select>
                    </div>
                )
            })}
        </div>
    )
}

export default Form;