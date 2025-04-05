import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import cv2
import os
from pathlib import Path

def create_binary_classifier():
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(1, activation='sigmoid')  
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    return model

def load_ewaste_dataset(base_dir, img_size=(224, 224)):
    images = []
    labels = []
    
 
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png']:
        image_files.extend(Path(base_dir).rglob(ext))
        image_files.extend(Path(base_dir).rglob(ext.upper()))
    
    for img_path in image_files:
        try:
            img = cv2.imread(str(img_path))
            img = cv2.resize(img, img_size)
            img = img / 255.0  
            images.append(img)
            labels.append(1)  
        except Exception as e:
            print(f"Error loading {img_path}: {e}")
            continue
    
    return np.array(images), np.array(labels)

def train_model():

    print("Loading training dataset...")
    train_images, train_labels = load_ewaste_dataset('train')
    
    print("Loading validation dataset...")
    val_images, val_labels = load_ewaste_dataset('val')
    
    print("Loading test dataset...")
    test_images, test_labels = load_ewaste_dataset('test')
    

    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.2),
        layers.RandomBrightness(0.2),

        layers.RandomContrast(0.3),
        layers.RandomTranslation(0.2, 0.2),
    ])
    

    model = create_binary_classifier()
    
    # Train the model
    history = model.fit(
        data_augmentation(train_images),
        train_labels,
        validation_data=(val_images, val_labels),
        epochs=20,
        batch_size=32,
        callbacks=[
            tf.keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=3,
                restore_best_weights=True
            )
        ]
    )
    
    # Evaluate on test dataset
    test_loss, test_accuracy = model.evaluate(test_images, test_labels)
    print(f"\nTest accuracy: {test_accuracy:.4f}")
    
    # Save the model
    model.save('waste_classifier_binary.h5')
    
    return model, history

def detect_and_classify_waste(image_path, model, confidence_threshold=0.5):
    # Read the image
    original_img = cv2.imread(image_path)
    if original_img is None:
        raise ValueError(f"Could not read image at {image_path}")
    
    # Create a copy for drawing
    display_img = original_img.copy()
    
    # Preprocessing for object detection
    gray = cv2.cvtColor(original_img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Try different thresholding methods
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Find contours
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    results = []
    
    # Process each detected object
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 1000:  # Minimum area threshold to filter small noise
            # Get bounding box
            x, y, w, h = cv2.boundingRect(contour)
            
            # Extract ROI
            roi = original_img[y:y+h, x:x+w]
            
            # Preprocess ROI for classification
            roi_resized = cv2.resize(roi, (224, 224))
            roi_normalized = roi_resized / 255.0
            
            # Predict
            prediction = model.predict(np.expand_dims(roi_normalized, axis=0))[0][0]
            
            # Apply confidence threshold
            if prediction >= confidence_threshold:
                waste_type = "E-Waste"
                color = (0, 0, 255)  # Red for e-waste
            else:
                waste_type = "Normal Waste"
                color = (0, 255, 0)  # Green for normal waste
            
            # Draw bounding box and label
            cv2.rectangle(display_img, (x, y), (x+w, y+h), color, 2)
            label = f"{waste_type}: {prediction:.2f}"
            cv2.putText(display_img, label, (x, y-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            results.append({
                'type': waste_type,
                'confidence': float(prediction),
                'location': (x, y, w, h)
            })
    
    return display_img, results

def main():
    # Train or load model
    if not os.path.exists('waste_classifier_binary.h5'):
        print("Training new model...")
        model, history = train_model()
        
        # Plot training history
        import matplotlib.pyplot as plt
        plt.figure(figsize=(12, 4))
        
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'], label='Training Accuracy')
        plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        
        plt.subplot(1, 2, 2)
        plt.plot(history.history['loss'], label='Training Loss')
        plt.plot(history.history['val_loss'], label='Validation Loss')
        plt.title('Model Loss')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        
        plt.tight_layout()
        plt.show()
    else:
        print("Loading existing model...")
        model = tf.keras.models.load_model('waste_classifier_binary.h5')
    
    # Test on a new image with multiple waste objects
    while True:
        image_path = input("Enter the path to test image (or 'q' to quit): ")
        if image_path.lower() == 'q':
            break
            
        try:
            processed_image, results = detect_and_classify_waste(image_path, model)
            
            # Display results
            cv2.imshow('Waste Classification', processed_image)
            key = cv2.waitKey(0)
            cv2.destroyAllWindows()
            
            # Print detailed results
            print("\nDetection Results:")
            for i, result in enumerate(results, 1):
                print(f"\nObject {i}:")
                print(f"Type: {result['type']}")
                print(f"Confidence: {result['confidence']:.2f}")
                print(f"Location: {result['location']}")
            
            if key == ord('q'):
                break
                
        except Exception as e:
            print(f"Error processing image: {e}")

if __name__ == "__main__":
    main()