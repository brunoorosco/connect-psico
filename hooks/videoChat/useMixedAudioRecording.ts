import { useEffect, useRef, useState } from "react";

export function useMixedAudioRecording(localStream: MediaStream | null, remoteStreams: MediaStream[]) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  useEffect(() => {
    if (!localStream) return;

    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    const localSource = audioContext.createMediaStreamSource(localStream);
    localSource.connect(destination);

    remoteStreams.forEach((stream) => {
      const remoteSource = audioContext.createMediaStreamSource(stream);
      remoteSource.connect(destination);
    });

    const mixedStream = destination.stream;

    const mediaRecorder = new MediaRecorder(mixedStream, { mimeType: "audio/webm" });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };

    mediaRecorderRef.current = mediaRecorder;

    return () => {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      audioContext.close();
    };
  }, [localStream, remoteStreams]);

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      setRecordedChunks([]);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    recordedChunks,
    startRecording,
    stopRecording,
  };
}
