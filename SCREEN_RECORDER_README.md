# 🎥 Loom-Style Screen Recorder

A production-ready screen recording component for Coachly (usecoachly.com) that captures screen, webcam, and microphone simultaneously.

## 🚀 Features

- **Screen Capture**: Record entire screen or specific application windows
- **Webcam Overlay**: Optional webcam feed displayed in the corner
- **Audio Recording**: Capture system audio and microphone input
- **Live Preview**: See what you're recording in real-time
- **Recording Timer**: Track recording duration
- **Download**: Save recordings locally as `.webm` files
- **Upload**: Send recordings to server via API
- **Responsive UI**: Built with TailwindCSS for modern, clean design
- **Error Handling**: Graceful permission handling and error messages
- **Browser Compatible**: Works in Chrome, Firefox, and Edge

## 📦 Installation

### Frontend Dependencies

```bash
cd frontend
npm install lucide-react
```

### Backend Dependencies

```bash
cd backend
npm install multer
```

## 🎯 Usage

### Basic Implementation

```tsx
import ScreenRecorder from './components/shared/ScreenRecorder';

function App() {
  const handleUploadComplete = (url: string) => {
    console.log('Video uploaded:', url);
  };

  return (
    <ScreenRecorder 
      onUploadComplete={handleUploadComplete}
      maxDurationSeconds={600}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUploadComplete` | `(url: string) => void` | - | Callback when upload finishes |
| `maxDurationSeconds` | `number` | `600` | Maximum recording duration |

## 🔧 Backend API

### Upload Endpoint

**POST** `/api/upload-video`

Accepts `multipart/form-data` with field name `video`.

**Request:**
```bash
curl -X POST http://localhost:8000/api/upload-video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@recording.webm"
```

**Response:**
```json
{
  "success": true,
  "url": "http://localhost:8000/uploads/videos/recording-1234567890.webm",
  "path": "/uploads/videos/recording-1234567890.webm",
  "filename": "recording-1234567890.webm",
  "size": 5242880,
  "mimetype": "video/webm"
}
```

### List Videos (Optional)

**GET** `/api/videos`

Returns list of all uploaded videos.

### Delete Video (Optional)

**DELETE** `/api/videos/:filename`

Deletes a specific video file.

## 🏗️ Architecture

### Frontend Components

```
frontend/
├── components/
│   └── shared/
│       └── ScreenRecorder.tsx    # Main recorder component
└── features/
    └── screen-recorder/
        └── ScreenRecorderDemo.tsx # Demo page
```

### Backend Structure

```
backend/
├── server-local.js              # Express server with upload endpoint
└── uploads/
    └── videos/                  # Uploaded video storage
```

### Recording Flow

1. **Initialize**: User clicks "Start Recording"
2. **Permissions**: Browser requests screen/camera/mic access
3. **Capture**: MediaRecorder captures combined stream
4. **Preview**: Video preview shown during recording
5. **Stop**: User clicks "Stop Recording"
6. **Playback**: Recorded video displayed with controls
7. **Download/Upload**: User can download or upload to server

## 🔐 Security

- **Authentication Required**: Upload endpoint requires JWT token
- **File Validation**: Only video files (webm, mp4, mkv) accepted
- **Size Limits**: 500MB maximum file size
- **Local Processing**: Recording happens entirely in browser
- **Secure Storage**: Videos stored in protected uploads directory

## 🌐 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 74+     | ✅ Full support |
| Firefox | 72+     | ✅ Full support |
| Edge    | 79+     | ✅ Full support |
| Safari  | 14.1+   | ⚠️ Partial (no webcam overlay) |

## 📝 Technical Details

### APIs Used

- **`navigator.mediaDevices.getDisplayMedia()`**: Screen capture
- **`navigator.mediaDevices.getUserMedia()`**: Webcam & microphone
- **`MediaRecorder`**: Recording the combined stream
- **`MediaStream`**: Merging multiple media tracks

### Video Format

- **Codec**: VP9 (fallback to VP8)
- **Audio Codec**: Opus
- **Container**: WebM
- **Quality**: 1920x1080 @ 30fps (ideal)

### File Storage

Videos are saved in `backend/uploads/videos/` with format:
```
recording-{timestamp}-{random}.webm
```

## 🐛 Troubleshooting

### "Permission denied" error
- Check browser permissions for screen recording
- Ensure HTTPS is enabled (required for some browsers)
- Try different browser if issue persists

### "Recording failed" error
- Check if MediaRecorder API is supported
- Verify codec support in browser
- Check available disk space

### Upload fails
- Verify authentication token is valid
- Check file size (must be < 500MB)
- Ensure backend server is running
- Check network connection

## 🔄 Future Enhancements

- [ ] Pause/Resume recording
- [ ] Choose video quality settings
- [ ] Add drawing/annotation tools
- [ ] Trim video before upload
- [ ] Convert to MP4 format
- [ ] Cloud storage integration (S3, Supabase)
- [ ] Share links with expiration
- [ ] Video thumbnails
- [ ] Keyboard shortcuts

## 📄 License

Part of Coachly platform - Internal use only

## 🤝 Contributing

1. Test thoroughly in multiple browsers
2. Follow existing code style
3. Add comments for complex logic
4. Update this README if adding features

## 📧 Support

For issues or questions, contact the development team.

---

Built with ❤️ for Coachly by GitHub Copilot
