/**
 * RTCClient represents a WebRTC client for handling peer connections.
 * It facilitates the creation of offers and answers, and the handling of ICE candidates.
 */
export default class RTCClient {
    // Default configuration for the RTCPeerConnection.
    public static _CONFIG: RTCConfiguration = {
        iceServers: [
            {
                urls: "stun:stun.relay.metered.ca:80",
            },
        ],
        iceCandidatePoolSize: 10,
    };

    private _rtcConnection: RTCPeerConnection;
    private _remoteStream: MediaStream;

    /**
     * Creates a new instance of RTCClient.
     * @param localStream The local MediaStream to be used in the connection.
     * @param onIce Callback function to handle ICE candidates when they are gathered.
     */
    constructor(localStream: MediaStream, onIce: (ice: any) => void) {
        // Initialize the RTCPeerConnection with the provided configuration.
        this._rtcConnection = new RTCPeerConnection(RTCClient._CONFIG);

        // Add all tracks from the local MediaStream to the RTCPeerConnection.
        localStream.getTracks().forEach((track) => {
            this._rtcConnection.addTrack(track, localStream);
        });

        // Create an empty MediaStream to hold the remote stream.
        this._remoteStream = new MediaStream();

        // Handle incoming tracks from the remote peer and add them to the remote stream.
        this._rtcConnection.ontrack = (e) => {
            e.streams[0].getTracks().forEach((track) => {
                this._remoteStream.addTrack(track);
            });
        };

        // Handle ICE candidates and call the provided callback to send them to the remote peer.
        this._rtcConnection.onicecandidate = (e) => {
            onIce(e.candidate);
        };
    }

    /**
     * Creates an answer to a received offer and sets the local and remote descriptions.
     * @param remoteDescription The description of the received offer.
     * @returns The local description created for the answer.
     */
    public createAnswer = async (remoteDescription: any) => {
        await this._rtcConnection.setRemoteDescription(remoteDescription);
        const localDescription = await this._rtcConnection.createAnswer();
        await this._rtcConnection.setLocalDescription(localDescription);
        return localDescription;
    }

    /**
     * Creates an offer and sets the local description.
     * @returns The local description created for the offer.
     */
    public createOffer = async () => {
        const localDescription = await this._rtcConnection.createOffer();
        await this._rtcConnection.setLocalDescription(localDescription);
        return localDescription;
    }

    /**
     * Adds an ICE candidate to the connection.
     * @param ice The ICE candidate to be added.
     */
    public addIce = (ice: any) => {
        this._rtcConnection.addIceCandidate(ice);
    }

    /**
     * Sets the remote description of the connection.
     * @param description The remote description to be set.
     */
    public setRemoteDescription = async (description: any) => {
        await this._rtcConnection.setRemoteDescription(description);
    }

    /**
     * Gets the remote MediaStream.
     * @returns The remote MediaStream.
     */
    get remoteStream() {
        return this._remoteStream;
    }
}
