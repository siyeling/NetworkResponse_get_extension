let currentTab,debaggeeId;
const version = "1.3";


chrome.action.onClicked.addListener(() => {
    chrome.tabs.query(
        //発火させたタブを取得
        {
            currentWindow: true,
            active: true
        },
        (tabArray) => {
            currentTab = tabArray[0];

            if(currentTab.id == debaggeeId){
                chrome.debugger.detach({
                    tabId: currentTab.id
                },
                console.log('デバッガーは切断されました'))
                debaggeeId = '';
                return;
            }

            debaggeeId = currentTab.id
            //指定タブに接続
            chrome.debugger.attach({
                tabId: currentTab.id
            },
            version,
            ()=>{
                console.log('デバッガーは接続されました');
                chrome.debugger.sendCommand({
                    tabId:currentTab.id
                },
                "Network.enable"
                );

                


                chrome.debugger.onDetach.addListener((debuggee,detachReason)=>{
                    console.log(`${debuggee.tabId}から後述の理由で切断しました:${detachReason}`)
                });

                chrome.debugger.onEvent.addListener((debuggee, method, params)=>{
                    //今回はresponse限定
                    if(method == "Network.responseReceived"){

                        chrome.debugger.sendCommand({
                            tabId: debuggee.tabId
                        },
                        //通信内容を読み取るメソッド
                        "Network.getResponseBody",
                        {
                            //引数にrequestIdが必要
                            "requestId": params.requestId
                        },
                        //responsebodyを返す
                        (response) => {
                            console.table(response)
                        })
                    }
                })
            });
        }
    )
})