import * as signalR from '@microsoft/signalr'

const connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:5134/clipboardhub')
    .withAutomaticReconnect()
    .build()

export default connection
