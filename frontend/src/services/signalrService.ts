import * as signalR from '@microsoft/signalr'

const connection = new signalR.HubConnectionBuilder()
    .withUrl(import.meta.env.VITE_SIGNALR_URL || '/clipboardhub')
    .withAutomaticReconnect()
    .build()

export default connection
