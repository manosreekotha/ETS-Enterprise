import sys, os
import unittest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.app.data_loader import data_loader
from backend.app.analytics import analytics_engine

class TestDataIntegrity(unittest.TestCase):
    def test_employee_count(self):
        self.assertEqual(len(data_loader.df_employees), 590)

    def test_skills_baseline(self):
        self.assertEqual(len(data_loader.df_skills), 21)
        self.assertEqual(data_loader.df_skills['Skill Name'].nunique(), 13)

    def test_finance_history_baseline(self):
        self.assertEqual(len(data_loader.df_finance), 65)

    def test_leave_records_baseline(self):
        self.assertEqual(len(data_loader.df_leave), 799)

    def test_state_counts(self):
        state_counts = data_loader.df_employees['State'].value_counts().to_dict()
        self.assertEqual(state_counts.get('NH'), 364)
        self.assertEqual(state_counts.get('ND'), 118)
        self.assertEqual(state_counts.get('AK'), 108)
        self.assertEqual(sum(state_counts.values()), 590)

    def test_location_counts(self):
        loc_counts = data_loader.df_employees['LOCATION'].value_counts().to_dict()
        self.assertEqual(loc_counts.get('Bangalore'), 396)
        self.assertEqual(loc_counts.get('Hyderabad'), 171)
        self.assertEqual(loc_counts.get('Chennai'), 13)
        self.assertEqual(loc_counts.get('Pune'), 10)
        self.assertEqual(sum(loc_counts.values()), 590)

    def test_salary_metrics(self):
        df_emp = data_loader.df_employees
        self.assertAlmostEqual(df_emp['EMP_CTC1'].mean(), 776779.66, delta=1.0)
        self.assertEqual(df_emp['EMP_CTC1'].max(), 5000000.0)
        self.assertEqual(df_emp['EMP_CTC1'].min(), 150000.0)

    def test_grade_metrics(self):
        grades = set(data_loader.df_employees['JOB LEVEL'].dropna().unique())
        expected_grades = {'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10'}
        self.assertEqual(grades, expected_grades)

    def test_calendar_data(self):
        cal_data = analytics_engine.get_calendar_data()
        self.assertEqual(cal_data['unique_employees_on_leave'], 78)
        self.assertAlmostEqual(cal_data['total_leave_days'], 1937.5, delta=0.5)

    def test_employee_lookup_valid_and_invalid(self):
        emp_valid = analytics_engine.get_employee_details(1019272)
        self.assertEqual(emp_valid['employee_number'], 1019272)
        self.assertIn('Anand', emp_valid['name'])

        df_emp = data_loader.df_employees
        invalid_match = df_emp[df_emp['EMPLOYEE NUMBER'] == 999999999]
        self.assertTrue(invalid_match.empty)

if __name__ == '__main__':
    unittest.main()
