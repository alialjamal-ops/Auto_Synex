import sys
from PIL import Image

def remove_white_bg(img_path, out_path):
    img = Image.open(img_path).convert('RGBA')
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Change all white (also shades of whites)
        # item is (R, G, B, A)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(out_path, 'PNG')

remove_white_bg(r"c:\Auto Synex\public\assets\logo.png", r"c:\Auto Synex\public\assets\logo_transparent.png")
print("SUCCESS")
