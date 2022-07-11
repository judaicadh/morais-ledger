import pandas as pd
import re

file = pd.read_csv("term_pids.csv")
file['pid2'] =  ''

for idx, row in file.iterrows(): 
    term = row['label']
    res = re.sub(r'[^a-zA-Z]', '', term)
    row['pid2'] = res


file.to_csv("edited_term_pids.csv")

