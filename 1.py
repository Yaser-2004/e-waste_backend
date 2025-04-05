import cv2
import numpy as np
from tensorflow.keras.models import load_model

def preprocess_roi(roi):
    roi_resized = cv2.resize(roi, (224, 224))
    roi_normalized = roi_resized / 255.0
    return np.expand_dims(roi_normalized, axis=0)

def analyze_waste_image(image_path, model, threshold=0.5):

    original = cv2.imread(image_path)
    if original is None:
        raise FileNotFoundError(f"Cannot read image: {image_path}")

    display = original.copy()

    gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, binary = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    detections = []

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 1000:
            continue

        x, y, w, h = cv2.boundingRect(cnt)
        roi = original[y:y+h, x:x+w]
        input_data = preprocess_roi(roi)

        prediction = model.predict(input_data, verbose=0)[0][0]
        label = "E-Waste" if prediction >= threshold else "Normal Waste"
        color = (0, 0, 255) if label == "E-Waste" else (0, 255, 0)

        cv2.rectangle(display, (x, y), (x+w, y+h), color, 2)
        cv2.putText(display, f"{label}: {prediction:.2f}", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        detections.append({
            "label": label,
            "confidence": float(prediction),
            "box": (x, y, w, h)
        })

    return display, detections

model = load_model("waste_classifier_binary.h5")


image_path = "2.png"  


annotated_image, results = analyze_waste_image(image_path, model)

#
cv2.imshow("Classified Waste", annotated_image)
cv2.waitKey(0)
cv2.destroyAllWindows()

for i, detection in enumerate(results, 1):
    print(f"Object {i}: {detection['label']} (Confidence: {detection['confidence']:.2f}) at {detection['box']}")
