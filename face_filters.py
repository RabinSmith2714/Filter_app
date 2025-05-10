import cv2
import mediapipe as mp
import numpy as np

class FaceFilterApp:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.current_filter = None
        self.cap = None
        self.is_running = False

    def start_camera(self):
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("Error: Could not open camera")
            return
        print("Camera started. Press 'q' to quit.")
        self.is_running = True
        self.run()

    def stop_camera(self):
        self.is_running = False
        if self.cap is not None:
            self.cap.release()
        cv2.destroyAllWindows()

    def set_filter(self, filter_name):
        self.current_filter = filter_name
        print(f"Filter set to: {filter_name}")

    def draw_sunglasses(self, frame, landmarks):
        # Get eye landmarks
        left_eye = landmarks[33:46]
        right_eye = landmarks[362:375]
        
        # Calculate sunglasses position and size
        left_eye_center = np.mean(left_eye, axis=0)
        right_eye_center = np.mean(right_eye, axis=0)
        
        # Draw sunglasses
        cv2.ellipse(
            frame,
            (int((left_eye_center[0] + right_eye_center[0]) / 2),
             int((left_eye_center[1] + right_eye_center[1]) / 2)),
            (int(abs(right_eye_center[0] - left_eye_center[0]) * 1.2),
             int(abs(right_eye_center[1] - left_eye_center[1]) * 0.8)),
            0, 0, 360, (0, 0, 0), -1
        )

    def draw_hat(self, frame, landmarks):
        # Get forehead position
        forehead = landmarks[10]
        left_eye = landmarks[33]
        right_eye = landmarks[362]
        
        # Draw hat
        points = np.array([
            [int(left_eye[0] - 40), int(forehead[1] - 60)],
            [int(right_eye[0] + 40), int(forehead[1] - 60)],
            [int(right_eye[0] + 20), int(forehead[1] - 30)],
            [int(left_eye[0] - 20), int(forehead[1] - 30)]
        ], np.int32)
        cv2.fillPoly(frame, [points], (0, 0, 255))  # Red hat

    def draw_mustache(self, frame, landmarks):
        # Get mouth landmarks
        mouth = landmarks[61:68]
        
        # Draw mustache
        points = np.array([
            [int(mouth[0][0]), int(mouth[0][1])],
            [int((mouth[0][0] + mouth[6][0]) / 2), int(mouth[0][1] + 20)],
            [int(mouth[6][0]), int(mouth[6][1])]
        ], np.int32)
        cv2.polylines(frame, [points], False, (0, 0, 0), 5)

    def run(self):
        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to read from camera")
                break

            # Flip the frame horizontally for a later selfie-view display
            frame = cv2.flip(frame, 1)
            
            # Convert the BGR image to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process the frame and get face landmarks
            results = self.face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                for face_landmarks in results.multi_face_landmarks:
                    # Convert landmarks to numpy array
                    landmarks = np.array([[lm.x * frame.shape[1], lm.y * frame.shape[0]] 
                                        for lm in face_landmarks.landmark])
                    
                    # Apply selected filter
                    if self.current_filter == 'sunglasses':
                        self.draw_sunglasses(frame, landmarks)
                    elif self.current_filter == 'hat':
                        self.draw_hat(frame, landmarks)
                    elif self.current_filter == 'mustache':
                        self.draw_mustache(frame, landmarks)

            # Display the frame
            cv2.imshow('Face Filter App', frame)
            
            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        self.stop_camera()

def main():
    app = FaceFilterApp()
    
    # Create window and trackbars
    cv2.namedWindow('Controls')
    cv2.createTrackbar('Filter', 'Controls', 0, 3, lambda x: None)
    
    # Add filter labels
    filter_labels = ['No Filter', 'Sunglasses', 'Hat', 'Mustache']
    cv2.putText(cv2.getWindowImageRect('Controls')[0], 
                filter_labels[0], (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                0.7, (255, 255, 255), 2)
    
    print("Starting application...")
    # Start camera
    app.start_camera()
    
    while True:
        # Get current filter selection
        filter_idx = cv2.getTrackbarPos('Filter', 'Controls')
        if filter_idx == 0:
            app.set_filter(None)
        elif filter_idx == 1:
            app.set_filter('sunglasses')
        elif filter_idx == 2:
            app.set_filter('hat')
        elif filter_idx == 3:
            app.set_filter('mustache')
        
        # Break if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    app.stop_camera()

if __name__ == '__main__':
    main() 