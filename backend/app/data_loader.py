import os
import pandas as pd
import numpy as np
from datetime import datetime

# Reference date for tenure calculation (matches Power BI dataset max date ~ Oct 2024 / current)
REF_DATE = pd.to_datetime('2024-10-10')

class DataLoader:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(DataLoader, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, file_path: str = None):
        if getattr(self, '_initialized', False):
            return
        
        if file_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            file_path = os.path.join(base_dir, 'ETS_Dasboard_DS.xlsx')
            if not os.path.exists(file_path):
                # Fallback to local
                file_path = 'ETS_Dasboard_DS.xlsx'
        
        self.file_path = file_path
        self.load_data()
        self._initialized = True

    def load_data(self):
        print(f'Loading data from: {self.file_path}')
        
        # 1. Load EMPLOYEES (skip first 2 rows of headers/notes)
        df_emp = pd.read_excel(self.file_path, sheet_name='EMPLOYEES', skiprows=2)
        # Drop unnamed empty columns
        cols_to_keep = [c for c in df_emp.columns if not str(c).startswith('Unnamed:')]
        df_emp = df_emp[cols_to_keep].copy()
        
        # Clean columns
        df_emp['EMPLOYEE NUMBER'] = pd.to_numeric(df_emp['EMPLOYEE NUMBER'], errors='coerce').fillna(0).astype(int)
        df_emp = df_emp[df_emp['EMPLOYEE NUMBER'] > 0].copy()
        
        # Parse Dates
        df_emp['START DATE'] = pd.to_datetime(df_emp['START DATE'], errors='coerce')
        df_emp['EXIT DATE'] = pd.to_datetime(df_emp['EXIT DATE'], errors='coerce')
        df_emp['DATE OF BIRTH'] = pd.to_datetime(df_emp['DATE OF BIRTH'], errors='coerce')
        
        # Experiences
        df_emp['Prior_Exp'] = pd.to_numeric(df_emp['Prior EXPERIENCE1'], errors='coerce').fillna(0.0)
        
        # Infinite / ETS experience (years from START DATE to EXIT DATE or REF_DATE)
        end_dates = df_emp['EXIT DATE'].fillna(REF_DATE)
        df_emp['Infinite_Exp'] = np.maximum(0.0, (end_dates - df_emp['START DATE']).dt.days / 365.25).round(2)
        df_emp['Total_Exp'] = (df_emp['Prior_Exp'] + df_emp['Infinite_Exp']).round(2)
        
        # CTC & Monthly Salary
        df_emp['EMP_CTC1'] = pd.to_numeric(df_emp['EMP_CTC1'], errors='coerce').fillna(0.0)
        df_emp['M_Salary'] = pd.to_numeric(df_emp['M_Salary'], errors='coerce').fillna(df_emp['EMP_CTC1'] / 12).round(2)
        df_emp['Prev_CTC2'] = pd.to_numeric(df_emp['Prev_CTC2'], errors='coerce').fillna(0.0)
        df_emp['Last_Bonus'] = pd.to_numeric(df_emp['Last_Bonus'], errors='coerce').fillna(0.0)
        df_emp['Hike_Percentage'] = pd.to_numeric(df_emp['Hike_Percentage'], errors='coerce').fillna(0.0)
        
        # Categorical fallbacks
        df_emp['GENDER'] = df_emp['GENDER'].fillna('Unknown').astype(str).str.strip()
        df_emp['LOCATION'] = df_emp['LOCATION'].fillna('Unknown').astype(str).str.strip()
        df_emp['State'] = df_emp['State'].fillna('Unknown').astype(str).str.strip()
        df_emp['Project Working'] = df_emp['Project Working'].fillna(df_emp['State']).astype(str).str.strip()
        df_emp['JOB LEVEL'] = df_emp['JOB LEVEL'].fillna('Unknown').astype(str).str.strip()
        df_emp['JOB TITLE'] = df_emp['JOB TITLE'].fillna('Unknown').astype(str).str.strip()
        df_emp['DEPARTMENT'] = df_emp['DEPARTMENT'].fillna('Core').astype(str).str.strip()
        df_emp['MANAGER'] = df_emp['MANAGER'].fillna('Unassigned').astype(str).str.strip()
        df_emp['EMPLOYEE LABEL'] = df_emp['EMPLOYEE LABEL'].fillna(
            df_emp['EMPLOYEE FIRST NAME'].astype(str) + ' ' + df_emp['EMPLOYEE LAST NAME'].astype(str) + ' (' + df_emp['EMPLOYEE NUMBER'].astype(str) + ')'
        ).astype(str).str.strip()
        
        # Salary Bin categorization
        def get_salary_bin(ctc):
            if ctc < 500000:
                return '< 5L'
            elif ctc < 1000000:
                return '5-10L'
            elif ctc < 1500000:
                return '10-15L'
            elif ctc < 2000000:
                return '15-20L'
            else:
                return '20L+'
        df_emp['SalaryBin'] = df_emp['EMP_CTC1'].apply(get_salary_bin)
        
        self.df_employees = df_emp
        
        # 2. Load SKILL
        df_skill = pd.read_excel(self.file_path, sheet_name='SKILL')
        df_skill['EMPLOYEE NUMBER'] = pd.to_numeric(df_skill['EMPLOYEE NUMBER'], errors='coerce').fillna(0).astype(int)
        df_skill['Skill Name'] = df_skill['Skill Name'].fillna('').astype(str).str.strip()
        df_skill['Skill Level'] = df_skill['Skill Level'].fillna('Intermediate').astype(str).str.strip()
        df_skill['Skill Type'] = df_skill['Skill Type'].fillna('Primary').astype(str).str.strip()
        df_skill['IsActive'] = df_skill['IsActive'].fillna('Yes').astype(str).str.strip()
        df_skill = df_skill[df_skill['Skill Name'] != ''].copy()
        self.df_skills = df_skill
        
        # 3. Load Finance_History
        df_fin = pd.read_excel(self.file_path, sheet_name='Finance_History')
        df_fin['EMPLOYEE NUMBER'] = pd.to_numeric(df_fin['EMPLOYEE NUMBER'], errors='coerce').fillna(0).astype(int)
        df_fin = df_fin[df_fin['EMPLOYEE NUMBER'] > 0].copy()
        df_fin['Year'] = pd.to_numeric(df_fin['Year'], errors='coerce').fillna(2024).astype(int)
        df_fin['Base_Salary'] = pd.to_numeric(df_fin['Base_Salary'], errors='coerce').fillna(0.0)
        df_fin['Bonus'] = pd.to_numeric(df_fin['Bonus'], errors='coerce').fillna(0.0)
        df_fin['Perks'] = pd.to_numeric(df_fin['Perks'], errors='coerce').fillna(0.0)
        df_fin['Other_Comp'] = pd.to_numeric(df_fin['Other_Comp'], errors='coerce').fillna(0.0)
        df_fin['M_Salary'] = pd.to_numeric(df_fin['M_Salary'], errors='coerce').fillna(0.0)
        df_fin['Total_CTC'] = pd.to_numeric(df_fin['Total_CTC'], errors='coerce').fillna(0.0)
        df_fin['Hike'] = pd.to_numeric(df_fin['Hike'], errors='coerce').fillna(0.0)
        df_fin['Is_Promotion'] = df_fin['Is_Promotion'].fillna('No').astype(str).str.strip()
        df_fin['SalaryBin'] = df_fin['Total_CTC'].apply(get_salary_bin)
        
        # Merge with employee metadata for fast slicing
        df_fin = df_fin.merge(
            self.df_employees[['EMPLOYEE NUMBER', 'EMPLOYEE LABEL', 'JOB LEVEL', 'DEPARTMENT', 'LOCATION', 'State', 'MANAGER']],
            on='EMPLOYEE NUMBER',
            how='left'
        )
        self.df_finance = df_fin
        
        # 4. Load LEAVE (skip first 2 rows)
        df_leave = pd.read_excel(self.file_path, sheet_name='LEAVE', skiprows=2)
        cols_leave = [c for c in df_leave.columns if not str(c).startswith('Unnamed:')]
        df_leave = df_leave[cols_leave].copy()
        
        # Extract Employee ID
        def extract_emp_num(text):
            if not isinstance(text, str):
                return 0
            if '(' in text and ')' in text:
                try:
                    return int(text.split('(')[-1].split(')')[0].strip())
                except:
                    return 0
            return 0
            
        df_leave['EMPLOYEE NUMBER'] = df_leave['EMPLOYEE'].apply(extract_emp_num)
        df_leave['START DATE'] = pd.to_datetime(df_leave['START DATE'], errors='coerce')
        df_leave['END DATE'] = pd.to_datetime(df_leave['END DATE'], errors='coerce')
        df_leave['LEAVE TYPE'] = df_leave['LEAVE TYPE'].fillna('Casual / Sick').astype(str).str.strip()
        df_leave['DAY VALUE'] = pd.to_numeric(df_leave['DAY VALUE'], errors='coerce').fillna(1.0)
        df_leave['LEAVE TYPE SYMBOL'] = df_leave['LEAVE TYPE SYMBOL'].fillna('C').astype(str).str.strip()
        
        # Merge with employee metadata
        df_leave = df_leave.merge(
            self.df_employees[['EMPLOYEE NUMBER', 'EMPLOYEE FIRST NAME', 'EMPLOYEE LAST NAME', 'JOB LEVEL', 'DEPARTMENT', 'LOCATION', 'State', 'MANAGER', 'Project Working']],
            on='EMPLOYEE NUMBER',
            how='left'
        )
        self.df_leave = df_leave
        
        print(f'Data Loaded Successfully:')
        print(f' - Employees: {len(self.df_employees)}')
        print(f' - Skills: {len(self.df_skills)}')
        print(f' - Finance History: {len(self.df_finance)}')
        print(f' - Leave Records: {len(self.df_leave)}')

data_loader = DataLoader()
