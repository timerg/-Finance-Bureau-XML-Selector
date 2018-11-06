import React from 'react'





function myFetch(path, csrf, timeout, data, resolveCB){
    return () => {
        let timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(resolve, timeout, () => window.alert('Request timeout! Please contact the server manager!'));
        })
        let bodyData = data ? JSON.stringify(data) : null
        let fetchPromise = new Promise((resolve, reject) => {
            fetch(path, {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrf,
                },
                redirect: 'follow',
                body: bodyData,
                credentials: 'include'

            }).then(
                (res) => {
                    if(res.ok) {
                        resolve(res)
                    } else {
                        console.error(res)
                        reject(new Error('Failed to fetch'))
                    }
                }, (e) => {
                    reject(() => {
                        console.error(e)
                        window.alert("Server Error")
                        return e
                    })
                }
            )
        })
        Promise.race([fetchPromise, timeoutPromise]).then((res) => {
            if(resolveCB) {
                resolveCB(res)
            }
        }).catch(e => {
            console.error(e)
        })
    }
}

function redirect(response) {
    console.log(response);
    if(response.ok) {
        if(response.redirected) {
            console.log('redirect');
            window.location = response.url
        }
    } else {
        console.error(response)
    }
}

const UserActions = ({ trInfos }) => {
    let csrf = document.getElementById('csrf-token').getElementsByTagName('input')[0].value
    let deleteList = Object.keys(trInfos).map(key => ({num: key, toDelete: trInfos[key].checked}))
    return (
        <div>
            <button type="button" id="submitButton" onClick={
                myFetch('submit/',
                csrf,
                8000,
                deleteList,
                (res) => {
                    res.blob().then((blob) => {
                        let fname = document.getElementById('file-name').innerHTML
            			download(blob, fname.slice(1, fname.length - 1))
                    })
                })
            }>提交</button>
            <button type="button" id="saveButton" onClick={
                myFetch('save/',
                csrf,
                4000,
                deleteList,
                () => window.alert("清單已儲存"))
            }>將勾選清單暫存</button>
            <button type="button" id="deleteButton" onClick={
                myFetch('delete/',
                csrf,
                4000,
                null,
                redirect)
            }>移除此份檔案</button>
        </div>
    )
}
export default UserActions