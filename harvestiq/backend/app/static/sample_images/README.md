# Sample Images

This directory contains sample crop images for testing the HarvestIQ upload and analysis functionality.

## Placeholder Files

The current files are placeholders. In a production environment, replace these with actual crop images:

- `tomatoes.jpg` - Sample tomato crop image
- `apples.jpg` - Sample apple orchard image  
- `strawberries.jpg` - Sample strawberry field image
- `oranges.jpg` - Sample orange grove image

## Image Requirements

For best results with ML models:
- **Format**: JPG, PNG, or TIFF
- **Resolution**: Minimum 640x640 pixels
- **Quality**: High quality, well-lit images
- **Content**: Clear view of crops with minimal background clutter

## ML Integration

When integrating real computer vision models:

1. Replace placeholder files with actual crop images
2. Update the `mock_ai_prediction()` function in `app/utils.py`
3. Integrate YOLOv8 or ONNX models for real detection
4. See `ml/README.md` for detailed integration instructions