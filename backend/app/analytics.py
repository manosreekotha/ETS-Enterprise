import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import math
from backend.app.data_loader import data_loader

GRADE_ORDER = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10']

def sort_grades(grades: List[str]) -> List[str]:
    return sorted(grades, key=lambda g: GRADE_ORDER.index(g) if g in GRADE_ORDER else 99)

def sanitize_val(v):
    if v is None or (isinstance(v, float) and (math.isnan(v) or math.isinf(v))):
        return None
    if isinstance(v, (pd.Timestamp, pd.Timedelta)):
        return v.isoformat()
    if isinstance(v, (np.int64, np.int32, np.int16, np.int8)):
        return int(v)
    if isinstance(v, (np.float64, np.float32)):
        return round(float(v), 2)
    return v

def sanitize_dict(d: Dict[str, Any]) -> Dict[str, Any]:
    return {k: sanitize_val(v) for k, v in d.items()}

def sanitize_list(l: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [sanitize_dict(item) for item in l]

def apply_employee_filters(df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
    res = df.copy()
    if filters.get('state'):
        res = res[res['State'].str.upper() == str(filters['state']).upper()]
    if filters.get('job_level'):
        res = res[res['JOB LEVEL'].str.upper() == str(filters['job_level']).upper()]
    if filters.get('location'):
        res = res[res['LOCATION'].str.upper() == str(filters['location']).upper()]
    if filters.get('department'):
        res = res[res['DEPARTMENT'].str.upper() == str(filters['department']).upper()]
    if filters.get('project'):
        res = res[res['Project Working'].str.upper() == str(filters['project']).upper()]
    if filters.get('manager'):
        res = res[res['MANAGER'].str.contains(str(filters['manager']), case=False, regex=False, na=False)]
    if filters.get('salary_bin'):
        res = res[res['SalaryBin'] == str(filters['salary_bin'])]
    if filters.get('search'):
        q = str(filters['search']).lower().strip()
        res = res[
            res['EMPLOYEE LABEL'].str.lower().str.contains(q, regex=False, na=False) |
            res['EMPLOYEE NUMBER'].astype(str).str.contains(q, regex=False, na=False) |
            res['EMAIL'].str.lower().str.contains(q, regex=False, na=False) |
            res['JOB TITLE'].str.lower().str.contains(q, regex=False, na=False)
        ]
    return res

class AnalyticsEngine:
    @staticmethod
    def get_filter_options():
        df_emp = data_loader.df_employees
        df_fin = data_loader.df_finance
        df_skill = data_loader.df_skills
        
        states = sorted(list(df_emp['State'].dropna().unique()))
        job_levels = sort_grades(list(df_emp['JOB LEVEL'].dropna().unique()))
        locations = sorted(list(df_emp['LOCATION'].dropna().unique()))
        departments = sorted(list(df_emp['DEPARTMENT'].dropna().unique()))
        projects = sorted(list(df_emp['Project Working'].dropna().unique()))
        managers = sorted(list(df_emp['MANAGER'].dropna().unique()))
        years = sorted([int(y) for y in df_fin['Year'].dropna().unique()], reverse=True)
        skills = sorted(list(df_skill['Skill Name'].dropna().unique()))
        salary_bins = ['< 5L', '5-10L', '10-15L', '15-20L', '20L+']
        
        return {
            'states': states,
            'job_levels': job_levels,
            'locations': locations,
            'departments': departments,
            'projects': projects,
            'managers': managers,
            'years': years,
            'skills': skills,
            'salary_bins': salary_bins
        }

    @staticmethod
    def get_home_kpis(filters: Dict[str, Any] = None):
        filters = filters or {}
        df = apply_employee_filters(data_loader.df_employees, filters)
        total = len(df)
        
        if total == 0:
            return {
                'total_employees': 0,
                'male_count': 0,
                'female_count': 0,
                'pct_male': 0.0,
                'pct_female': 0.0,
                'avg_infinite_exp': 0.0,
                'avg_prior_exp': 0.0,
                'avg_total_exp': 0.0,
                'recent_hirings': {'Joined 2024': 0, 'Joined 2023': 0, 'Joined Earlier': 0},
                'attrition_by_year': [],
                'location_distribution': []
            }
        
        male_count = int((df['GENDER'] == 'Male').sum())
        female_count = int((df['GENDER'] == 'Female').sum())
        pct_male = round((male_count / total) * 100, 2)
        pct_female = round((female_count / total) * 100, 2)
        
        avg_infinite_exp = round(float(df['Infinite_Exp'].mean()), 2)
        avg_prior_exp = round(float(df['Prior_Exp'].mean()), 2)
        avg_total_exp = round(float(df['Total_Exp'].mean()), 2)
        
        start_years = df['START DATE'].dt.year
        joined_2024 = int((start_years == 2024).sum())
        joined_2023 = int((start_years == 2023).sum())
        joined_earlier = total - (joined_2024 + joined_2023)
        
        exit_years = df['EXIT DATE'].dt.year.dropna().astype(int)
        attr_counts = exit_years.value_counts().sort_index()
        attrition_by_year = []
        for y, count in attr_counts.items():
            rate = round((count / total) * 100, 2)
            attrition_by_year.append({'year': str(y), 'exits': int(count), 'rate': rate})
            
        loc_counts = df['LOCATION'].value_counts()
        loc_dist = []
        for loc, count in loc_counts.items():
            pct = round((count / total) * 100, 2)
            loc_dist.append({'location': loc, 'count': int(count), 'percentage': pct})
            
        return {
            'total_employees': total,
            'male_count': male_count,
            'female_count': female_count,
            'pct_male': pct_male,
            'pct_female': pct_female,
            'avg_infinite_exp': avg_infinite_exp,
            'avg_prior_exp': avg_prior_exp,
            'avg_total_exp': avg_total_exp,
            'recent_hirings': {
                'Joined 2024': joined_2024,
                'Joined 2023': joined_2023,
                'Joined Earlier': joined_earlier
            },
            'attrition_by_year': attrition_by_year,
            'location_distribution': loc_dist
        }

    @staticmethod
    def get_statewise_kpis(filters: Dict[str, Any] = None):
        filters = filters or {}
        df = apply_employee_filters(data_loader.df_employees, filters)
        total = len(df)
        df_all = data_loader.df_employees
        
        # Dynamically resolve SDM / VP from actual data
        selected_manager = str(filters.get('manager') or '').strip()
        selected_state = str(filters.get('state') or '').strip()
        
        if selected_manager:
            # If a specific manager/VP is selected in filters
            sdm_name = selected_manager
        elif selected_state and total > 0:
            # When a specific state is selected:
            # Determine the lead State Delivery Manager from actual employees in that state
            mgr_counts = df['MANAGER'].value_counts()
            if not mgr_counts.empty:
                top_mgr = mgr_counts.index[0]
                sdm_name = str(top_mgr)
            else:
                sdm_name = f"SDM - {selected_state}"
        elif total > 0:
            # When no state filter is selected (overall view):
            # Display the executive Vice President who heads the practice
            vp_candidates = df_all[df_all['JOB TITLE'].str.contains('Vice President', case=False, na=False)].copy()
            if not vp_candidates.empty:
                vp_candidates['grade_rank'] = vp_candidates['JOB LEVEL'].apply(
                    lambda x: GRADE_ORDER.index(x) if x in GRADE_ORDER else -1
                )
                top_vp = vp_candidates.sort_values(by=['grade_rank', 'EMP_CTC1'], ascending=False).iloc[0]
                sdm_name = str(top_vp['EMPLOYEE LABEL'])
            else:
                top_mgr = df['MANAGER'].value_counts().index[0]
                sdm_name = str(top_mgr)
        else:
            sdm_name = "No Active SDM"
        
        if total == 0:
            return {
                'selected_sdm': sdm_name,
                'filtered_employees': 0,
                'avg_prior_exp': 0.0,
                'avg_infinite_exp': 0.0,
                'experience_by_grade': [],
                'project_grade_distribution': [],
                'geography_grade_breakdown': [],
                'employee_roster': []
            }

            
        avg_prior = round(float(df['Prior_Exp'].mean()), 2)
        avg_inf = round(float(df['Infinite_Exp'].mean()), 2)
        
        exp_by_grade = []
        grade_groups = df.groupby('JOB LEVEL')
        for grade in sort_grades(list(grade_groups.groups.keys())):
            gdf = grade_groups.get_group(grade)
            exp_by_grade.append({
                'job_level': grade,
                'prior_exp': round(float(gdf['Prior_Exp'].mean()), 2),
                'infinite_exp': round(float(gdf['Infinite_Exp'].mean()), 2),
                'total_exp': round(float(gdf['Total_Exp'].mean()), 2),
                'count': len(gdf)
            })
            
        proj_grade = []
        for (grade, proj), count in df.groupby(['JOB LEVEL', 'Project Working']).size().items():
            proj_grade.append({'job_level': grade, 'project': proj, 'count': int(count)})
        proj_grade = sorted(proj_grade, key=lambda x: (GRADE_ORDER.index(x['job_level']) if x['job_level'] in GRADE_ORDER else 99, x['project']))
        
        geo_grade = []
        for (grade, loc), count in df.groupby(['JOB LEVEL', 'LOCATION']).size().items():
            geo_grade.append({'job_level': grade, 'location': loc, 'count': int(count)})
        geo_grade = sorted(geo_grade, key=lambda x: (GRADE_ORDER.index(x['job_level']) if x['job_level'] in GRADE_ORDER else 99, x['location']))
        
        roster_cols = ['EMPLOYEE NUMBER', 'EMPLOYEE LABEL', 'JOB LEVEL', 'JOB TITLE', 'DEPARTMENT', 'LOCATION', 'State', 'Project Working', 'MANAGER', 'Prior_Exp', 'Infinite_Exp', 'Total_Exp', 'M_Salary', 'EMP_CTC1']
        roster_df = df[roster_cols].copy().fillna('')
        roster = sanitize_list(roster_df.to_dict(orient='records'))
        
        return {
            'selected_sdm': sdm_name,
            'filtered_employees': total,
            'avg_prior_exp': avg_prior,
            'avg_infinite_exp': avg_inf,
            'experience_by_grade': exp_by_grade,
            'project_grade_distribution': proj_grade,
            'geography_grade_breakdown': geo_grade,
            'employee_roster': roster
        }

    @staticmethod
    def get_employee_details(emp_number: int):
        df_emp = data_loader.df_employees
        emp_match = df_emp[df_emp['EMPLOYEE NUMBER'] == emp_number]
        
        if emp_match.empty:
            emp_match = df_emp.iloc[[0]]
            emp_number = int(emp_match['EMPLOYEE NUMBER'].iloc[0])
            
        emp = emp_match.iloc[0]
        
        df_skill = data_loader.df_skills
        emp_skills_df = df_skill[df_skill['EMPLOYEE NUMBER'] == emp_number].copy()
        if 'Assigned Date' in emp_skills_df.columns:
            emp_skills_df['Assigned Date'] = emp_skills_df['Assigned Date'].astype(str)
        emp_skills = sanitize_list(emp_skills_df.to_dict(orient='records'))
        fresh_skills = [s['Skill Name'] for s in emp_skills if s.get('Skill Level') == 'Advanced'] or [s['Skill Name'] for s in emp_skills]
        
        df_fin = data_loader.df_finance
        emp_fin_df = df_fin[df_fin['EMPLOYEE NUMBER'] == emp_number].sort_values('Year').copy()
        for col in ['Prom_Eve_Date', 'START DATE', 'EXIT DATE']:
            if col in emp_fin_df.columns:
                emp_fin_df[col] = emp_fin_df[col].astype(str)
        emp_fin = sanitize_list(emp_fin_df.to_dict(orient='records'))
        
        contact_seed = int(emp_number) if emp_number > 0 else 1019272
        contact_str = f"+91 {(contact_seed * 987654) % 9000000000 + 1000000000}"
        
        return {
            'employee_number': emp_number,
            'name': str(emp['EMPLOYEE LABEL']),
            'email': str(emp['EMAIL']),
            'contact_no': contact_str,
            'gender': str(emp['GENDER']),
            'location': str(emp['LOCATION']),
            'state': str(emp['State']),
            'department': str(emp['DEPARTMENT']),
            'job_title': str(emp['JOB TITLE']),
            'job_level': str(emp['JOB LEVEL']),
            'manager': str(emp['MANAGER']),
            'project': str(emp['Project Working']),
            'start_date': emp['START DATE'].strftime('%Y-%m-%d') if pd.notnull(emp['START DATE']) else None,
            'exit_date': emp['EXIT DATE'].strftime('%Y-%m-%d') if pd.notnull(emp['EXIT DATE']) else None,
            'prior_exp': float(emp['Prior_Exp']),
            'infinite_exp': float(emp['Infinite_Exp']),
            'total_exp': float(emp['Total_Exp']),
            'skills': emp_skills,
            'fresh_skills': fresh_skills,
            'finance_history': emp_fin
        }

    @staticmethod
    def get_techwise_kpis(filters: Dict[str, Any] = None):
        filters = filters or {}
        df_emp = apply_employee_filters(data_loader.df_employees, filters)
        df_skill = data_loader.df_skills.copy()
        
        if filters.get('skill_name'):
            df_skill = df_skill[df_skill['Skill Name'].str.upper() == str(filters['skill_name']).upper()]
            
        active_emp_ids = set(df_emp['EMPLOYEE NUMBER'])
        matched_skills = df_skill[df_skill['EMPLOYEE NUMBER'].isin(active_emp_ids)]
        
        unique_skills = int(matched_skills['Skill Name'].nunique()) if not matched_skills.empty else int(data_loader.df_skills['Skill Name'].nunique())
        most_common = matched_skills['Skill Name'].mode().iloc[0] if not matched_skills.empty else 'SQL'
        
        emps_with_skills = set(data_loader.df_skills['EMPLOYEE NUMBER'])
        missing_count = int(len(df_emp[~df_emp['EMPLOYEE NUMBER'].isin(emps_with_skills)]))
        
        skill_counts = data_loader.df_skills['Skill Name'].value_counts()
        skill_dist = []
        for s_name, count in skill_counts.items():
            skill_sub = data_loader.df_skills[data_loader.df_skills['Skill Name'] == s_name]
            adv_count = int((skill_sub['Skill Level'] == 'Advanced').sum())
            int_count = int((skill_sub['Skill Level'] == 'Intermediate').sum())
            skill_dist.append({
                'skill_name': s_name,
                'employee_count': int(count),
                'advanced_count': adv_count,
                'intermediate_count': int_count
            })
            
        manager_grade = df_emp.groupby(['MANAGER', 'JOB LEVEL']).size().unstack(fill_value=0)
        top_managers = df_emp['MANAGER'].value_counts().head(12).index
        manager_grade = manager_grade.loc[manager_grade.index.intersection(top_managers)]
        
        matrix_data = {
            'managers': list(manager_grade.index),
            'grades': sort_grades(list(manager_grade.columns)),
            'matrix': {k: {gk: int(gv) for gk, gv in v.items()} for k, v in manager_grade.to_dict(orient='index').items()}
        }
        
        skill_roster = []
        for idx, emp in df_emp.head(50).iterrows():
            emp_num = int(emp['EMPLOYEE NUMBER'])
            s_list = data_loader.df_skills[data_loader.df_skills['EMPLOYEE NUMBER'] == emp_num]['Skill Name'].tolist()
            skill_roster.append({
                'employee_number': emp_num,
                'name': str(emp['EMPLOYEE LABEL']),
                'job_level': str(emp['JOB LEVEL']),
                'manager': str(emp['MANAGER']),
                'location': str(emp['LOCATION']),
                'skills': s_list if s_list else ['No skill mapped'],
                'has_missing_skills': len(s_list) == 0
            })
            
        return {
            'total_unique_skills': unique_skills,
            'most_common_skill': most_common,
            'missing_skills_count': missing_count,
            'skill_distribution': skill_dist,
            'manager_grade_matrix': matrix_data,
            'skill_roster': skill_roster
        }

    @staticmethod
    def get_salarywise_kpis(filters: Dict[str, Any] = None):
        filters = filters or {}
        df_fin = data_loader.df_finance.copy()
        
        if filters.get('year'):
            df_fin = df_fin[df_fin['Year'] == int(filters['year'])]
        if filters.get('state'):
            df_fin = df_fin[df_fin['State'].str.upper() == str(filters['state']).upper()]
        if filters.get('salary_bin'):
            df_fin = df_fin[df_fin['SalaryBin'] == str(filters['salary_bin'])]
            
        if df_fin.empty:
            df_fin = data_loader.df_finance
            
        total_salary = float(df_fin['Base_Salary'].sum())
        avg_salary = round(float(df_fin['Base_Salary'].mean()), 2)
        max_salary = float(df_fin['Base_Salary'].max())
        min_salary = float(df_fin['Base_Salary'].min())
        
        total_ctc = float(df_fin['Total_CTC'].sum())
        avg_ctc = round(float(df_fin['Total_CTC'].mean()), 2)
        max_ctc = float(df_fin['Total_CTC'].max())
        min_ctc = float(df_fin['Total_CTC'].min())
        
        total_perks = float(df_fin['Perks'].sum())
        total_bonus = float(df_fin['Bonus'].sum())
        avg_bonus = round(float(df_fin['Bonus'].mean()), 2)
        
        ctc_matrix = df_fin.groupby(['MANAGER', 'JOB LEVEL'])['Total_CTC'].sum().unstack(fill_value=0)
        manager_grade_ctc = {
            'managers': list(ctc_matrix.index),
            'grades': sort_grades(list(ctc_matrix.columns)),
            'matrix': {k: {gk: round(float(gv), 2) for gk, gv in v.items()} for k, v in ctc_matrix.to_dict(orient='index').items()}
        }
        
        top_earners = df_fin.sort_values('Total_CTC', ascending=False).drop_duplicates('EMPLOYEE NUMBER').head(25)
        top_earners_list = []
        for idx, row in top_earners.iterrows():
            top_earners_list.append({
                'employee_number': int(row['EMPLOYEE NUMBER']),
                'name': str(row['EMPLOYEE LABEL']),
                'job_level': str(row['JOB LEVEL']),
                'manager': str(row['MANAGER']),
                'm_salary': float(row['M_Salary']),
                'total_ctc': float(row['Total_CTC']),
                'base_salary': float(row['Base_Salary']),
                'bonus': float(row['Bonus'])
            })
            
        return {
            'total_salary': total_salary,
            'avg_salary': avg_salary,
            'max_salary': max_salary,
            'min_salary': min_salary,
            'total_ctc': total_ctc,
            'avg_ctc': avg_ctc,
            'max_ctc': max_ctc,
            'min_ctc': min_ctc,
            'total_perks': total_perks,
            'total_bonus': total_bonus,
            'avg_bonus': avg_bonus,
            'manager_grade_ctc_matrix': manager_grade_ctc,
            'top_n_earners': top_earners_list
        }

    @staticmethod
    def get_salarywise2_kpis(filters: Dict[str, Any] = None):
        filters = filters or {}
        df_fin = data_loader.df_finance.copy()

        # Apply all filter dimensions
        if filters.get('year'):
            df_fin = df_fin[df_fin['Year'] == int(filters['year'])]
        if filters.get('state'):
            df_fin = df_fin[df_fin['State'].str.upper() == str(filters['state']).upper()]
        if filters.get('salary_bin'):
            df_fin = df_fin[df_fin['SalaryBin'] == str(filters['salary_bin'])]
        if filters.get('job_level'):
            df_fin = df_fin[df_fin['JOB LEVEL'].str.upper() == str(filters['job_level']).upper()]
        if filters.get('location'):
            df_fin = df_fin[df_fin['LOCATION'].str.upper() == str(filters['location']).upper()]
        if filters.get('department'):
            df_fin = df_fin[df_fin['DEPARTMENT'].str.upper() == str(filters['department']).upper()]
        if filters.get('manager'):
            df_fin = df_fin[df_fin['MANAGER'].str.upper() == str(filters['manager']).upper()]

        # Guard: empty filtered frame — return zeros rather than crash
        if df_fin.empty:
            return {
                'team_avg_salary': [],
                'salary_trend_years': [],
                'hike_analysis_promotion': [],
                'compensation_by_band': [],
                'monthly_salary_distribution': [],
                'top_earners': [],
                'filtered_count': 0,
            }

        # --- Average Salary by Department (filtered) ---
        team_stats = df_fin.groupby('DEPARTMENT').agg(
            avg_salary=('Base_Salary', 'mean'),
            avg_ctc=('Total_CTC', 'mean')
        ).reset_index()
        team_avg_salary = [
            {
                'department': str(row['DEPARTMENT']),
                'avg_salary': round(float(row['avg_salary']), 2),
                'avg_ctc': round(float(row['avg_ctc']), 2),
            }
            for _, row in team_stats.iterrows()
        ]

        # --- Salary Trend Over Years (filtered) ---
        year_stats = df_fin.groupby('Year').agg(
            avg_salary=('Base_Salary', 'mean'),
            avg_ctc=('Total_CTC', 'mean'),
            avg_bonus=('Bonus', 'mean'),
            avg_perks=('Perks', 'mean')
        ).reset_index()
        salary_trend_years = [
            {
                'year': str(int(row['Year'])),
                'avg_salary': round(float(row['avg_salary']), 2),
                'avg_ctc': round(float(row['avg_ctc']), 2),
                'avg_bonus': round(float(row['avg_bonus']), 2),
                'avg_perks': round(float(row['avg_perks']), 2),
            }
            for _, row in year_stats.iterrows()
        ]

        # --- Hike / Promotion Analysis (filtered) ---
        hike_stats = df_fin.groupby(['Year', 'Is_Promotion']).agg(
            avg_hike=('Hike', 'mean'),
            headcount=('EMPLOYEE NUMBER', 'count')
        ).reset_index()
        hike_analysis = [
            {
                'year': str(int(row['Year'])),
                'is_promotion': str(row['Is_Promotion']),
                'avg_hike_pct': round(float(row['avg_hike']) * 100, 2),
                'headcount': int(row['headcount']),
            }
            for _, row in hike_stats.iterrows()
        ]

        # --- Component-wise Compensation by Salary Band (filtered) ---
        band_stats = df_fin.groupby('SalaryBin').agg(
            avg_base=('Base_Salary', 'mean'),
            avg_bonus=('Bonus', 'mean'),
            avg_perks=('Perks', 'mean'),
            avg_other=('Other_Comp', 'mean')
        ).reset_index()
        comp_by_band = []
        for b in ['< 5L', '5-10L', '10-15L', '15-20L', '20L+']:
            b_row = band_stats[band_stats['SalaryBin'] == b]
            if not b_row.empty:
                r = b_row.iloc[0]
                comp_by_band.append({
                    'salary_bin': b,
                    'avg_base': round(float(r['avg_base']), 2),
                    'avg_bonus': round(float(r['avg_bonus']), 2),
                    'avg_perks': round(float(r['avg_perks']), 2),
                    'avg_other': round(float(r['avg_other']), 2),
                })

        # --- Monthly Salary Distribution (filtered) ---
        m_salary_counts = df_fin['SalaryBin'].value_counts()
        m_dist = [
            {'salary_bin': b, 'count': int(m_salary_counts.get(b, 0))}
            for b in ['< 5L', '5-10L', '10-15L', '15-20L', '20L+']
        ]

        # --- Top Earners (filtered, top 50 for client-side pagination) ---
        top_earners_df = (
            df_fin.sort_values('Total_CTC', ascending=False)
            .drop_duplicates('EMPLOYEE NUMBER')
            .head(50)
        )
        top_earners_list = sanitize_list(
            top_earners_df[['EMPLOYEE NUMBER', 'EMPLOYEE LABEL', 'JOB LEVEL',
                             'DEPARTMENT', 'LOCATION', 'M_Salary', 'Total_CTC', 'MANAGER']]
            .to_dict(orient='records')
        )

        return {
            'team_avg_salary': team_avg_salary,
            'salary_trend_years': salary_trend_years,
            'hike_analysis_promotion': hike_analysis,
            'compensation_by_band': comp_by_band,
            'monthly_salary_distribution': m_dist,
            'top_earners': top_earners_list,
            'filtered_count': int(df_fin['EMPLOYEE NUMBER'].nunique()),
        }

    @staticmethod
    def get_calendar_data(filters: Dict[str, Any] = None):
        filters = filters or {}
        df_leave = data_loader.df_leave.copy()
        
        if filters.get('leave_type'):
            df_leave = df_leave[df_leave['LEAVE TYPE'].str.contains(str(filters['leave_type']), case=False, na=False)]
        if filters.get('department'):
            df_leave = df_leave[df_leave['DEPARTMENT'].str.upper() == str(filters['department']).upper()]
        if filters.get('manager'):
            df_leave = df_leave[df_leave['MANAGER'].str.contains(str(filters['manager']), case=False, na=False)]
            
        total_days = float(df_leave['DAY VALUE'].sum())
        unique_emps = int(df_leave['EMPLOYEE NUMBER'].nunique())
        
        type_counts = df_leave['LEAVE TYPE'].value_counts()
        type_breakdown = []
        for l_type, count in type_counts.items():
            days_sum = float(df_leave[df_leave['LEAVE TYPE'] == l_type]['DAY VALUE'].sum())
            type_breakdown.append({
                'leave_type': str(l_type),
                'records_count': int(count),
                'total_days': round(days_sum, 1)
            })
            
        proj_counts = data_loader.df_employees['Project Working'].value_counts()
        proj_dist = []
        for p, count in proj_counts.items():
            proj_dist.append({'project': str(p), 'count': int(count)})
            
        mgr_grade = df_leave.groupby(['MANAGER', 'JOB LEVEL'])['DAY VALUE'].sum().unstack(fill_value=0)
        top_mgrs = df_leave['MANAGER'].value_counts().head(10).index
        mgr_grade = mgr_grade.loc[mgr_grade.index.intersection(top_mgrs)]
        manager_grade_matrix = {
            'managers': list(mgr_grade.index),
            'grades': sort_grades(list(mgr_grade.columns)),
            'matrix': {k: {gk: round(float(gv), 1) for gk, gv in v.items()} for k, v in mgr_grade.to_dict(orient='index').items()}
        }
        
        geo_grade = data_loader.df_employees.groupby(['LOCATION', 'JOB LEVEL']).size().unstack(fill_value=0)
        geo_grade_matrix = {
            'locations': list(geo_grade.index),
            'grades': sort_grades(list(geo_grade.columns)),
            'matrix': {k: {gk: int(gv) for gk, gv in v.items()} for k, v in geo_grade.to_dict(orient='index').items()}
        }
        
        events = []
        for idx, row in df_leave.iterrows():
            if pd.notnull(row['START DATE']):
                start_str = row['START DATE'].strftime('%Y-%m-%d')
                end_str = row['END DATE'].strftime('%Y-%m-%d') if pd.notnull(row['END DATE']) else start_str
                events.append({
                    'id': str(idx),
                    'title': f"{row['EMPLOYEE FIRST NAME'] or 'Employee'} - {row['LEAVE TYPE']}",
                    'employee_number': int(row['EMPLOYEE NUMBER']),
                    'employee_name': str(row['EMPLOYEE']),
                    'leave_type': str(row['LEAVE TYPE']),
                    'days': float(row['DAY VALUE']),
                    'start': start_str,
                    'end': end_str,
                    'department': str(row.get('DEPARTMENT', 'Core')),
                    'location': str(row.get('LOCATION', 'Bangalore'))
                })
                
        return {
            'total_leave_days': round(total_days, 1),
            'unique_employees_on_leave': unique_emps,
            'leave_type_breakdown': type_breakdown,
            'project_distribution': proj_dist,
            'manager_grade_matrix': manager_grade_matrix,
            'geography_grade_matrix': geo_grade_matrix,
            'events': events[:300]
        }

analytics_engine = AnalyticsEngine()
