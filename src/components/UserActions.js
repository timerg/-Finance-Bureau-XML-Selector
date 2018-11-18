// @flow

import React from 'react'
import { Map } from 'immutable'
import type { TrInfo } from './App'



function myFetch(path: string, csrf: string, timeout: number, data: any, resolveCB: (res: Response) => any){
    return () => {
        let timeoutPromise = new Promise((resolve, reject) => {
          const myBlob = new Blob()
          const resInit = {
            "status": 503,
            "statusText": 'Request timeout! Please contact the server manager!',
            "ok": false
          }
          let timeoutResponse = new Response(myBlob, resInit)
          setTimeout(resolve, timeout, timeoutResponse);
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

function redirect(response: Response) {
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

type Props = {
    trInfos: Map<string, TrInfo>
}

type deleteListItem = {
  num: string,
  toDelete: boolean
}

function createDeleteList(trInfos): Array<deleteListItem> {
  return trInfos.map((trInfo, key) =>
    ({ num: key, toDelete: trInfo.get('checked') })
  ).toList().toArray()

}

const UserActions = ({ trInfos }: Props) => {
    const csrfNode = document.getElementById('csrf-token')
    let csrf: string = ''
    if(csrfNode){
      csrf = csrfNode.getElementsByTagName('input')[0].value
    } else {
      console.error("no csrf token")
    }
    return (
        <div>
            <button type="button" id="submitButton" onClick={
                myFetch('submit/',
                csrf,
                8000,
                createDeleteList(trInfos),
                (res) => {
                    res.blob().then((blob) => {
                        let fnameNode = document.getElementById('file-name')
                        let fname = ''
                        if(fnameNode) {
                          fname = fnameNode.innerHTML
                        } else {
                          console.error("no file name")
                        }
            			download(blob, fname.slice(1, fname.length - 1))
                    })
                })
            }>提交</button>
            <button type="button" id="saveButton" onClick={
                myFetch('save/',
                csrf,
                4000,
                createDeleteList(trInfos),
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