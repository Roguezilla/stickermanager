import sys
import os

from io import BytesIO
from zipfile import ZipFile
from bs4 import BeautifulSoup
import requests
import re

url = sys.argv[1]
pack_id = re.search(r'(\d+)', url)[0]
request = requests.get(sys.argv[1])
try:
    title = BeautifulSoup(request.content, 'html.parser').find('p', attrs = {'data-test': 'sticker-name-title'}).getText()
except:
    title = BeautifulSoup(request.content, 'html.parser').find('div', attrs = {'role': 'main'}).find('h2').getText()

zipurl = f'https://stickershop.line-scdn.net/stickershop/v1/product/{pack_id}/iphone/stickers@2x.zip'

with ZipFile(BytesIO(requests.get(zipurl).content), 'r') as zip_ref:
    zip_ref.extractall(os.path.join('packs', title))

for _, _, files in os.walk(os.path.join('packs', title)): #generator quirk
    files_to_delete = list(filter(lambda f: '_key' in f or 'tab_' in f or 'productInfo' in f, files))

for file in files_to_delete:
    os.remove(os.path.join('packs', title, file))