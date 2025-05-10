import cv2
import mediapipe as mp
import numpy as np

def main():
    # Initialize MediaPipe Face Mesh
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    )

    # Start video capture
    cap = cv2.VideoCapture(0)
    print("Camera started. Press 'q' to quit.")

    while cap.isOpened():
        success, image = cap.read()
        if not success:
            print("Failed to read from camera")
            break

        # Flip the image horizontally for a later selfie-view display
        image = cv2.flip(image, 1)
        
        # Convert the BGR image to RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process the image and get face landmarks
        results = face_mesh.process(rgb_image)
        
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                # Convert landmarks to numpy array
                landmarks = np.array([[lm.x * image.shape[1], lm.y * image.shape[0]] 
                                    for lm in face_landmarks.landmark])
                
                # Draw face landmarks (green dots)
                for landmark in landmarks:
                    cv2.circle(image, (int(landmark[0]), int(landmark[1])), 1, (0, 255, 0), -1)
                
                # Draw a simple filter (red rectangle on forehead)
                forehead = landmarks[10]  # Forehead point
                left_eye = landmarks[33]  # Left eye point
                right_eye = landmarks[362]  # Right eye point
                
                # Draw a red rectangle above the eyes
                cv2.rectangle(
                    image,
                    (int(left_eye[0] - 20), int(forehead[1] - 40)),
                    (int(right_eye[0] + 20), int(forehead[1] - 20)),
                    (0, 0, 255),
                    -1
                )

        # Display the image
        cv2.imshow('Face Filter Test', image)
        
        # Break the loop if 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Clean up
    cap.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main() 