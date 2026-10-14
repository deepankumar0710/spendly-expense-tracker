from datetime import date
from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Expense

PASSWORD = "Str0ngPass!234"


class BaseExpenseTest(APITestCase):
    def setUp(self):
        self.asha = User.objects.create_user("asha", "asha@example.com", PASSWORD)
        self.ravi = User.objects.create_user("ravi", "ravi@example.com", PASSWORD)
        self.client.force_authenticate(user=self.asha)

    def make_expense(self, user, title="Lunch", amount="100.00", category="food", day=None):
        return Expense.objects.create(
            user=user,
            title=title,
            amount=Decimal(amount),
            category=category,
            date=day or timezone.localdate(),
        )

    def titles(self, response):
        return [item["title"] for item in response.data["results"]]


class ExpenseAPITests(BaseExpenseTest):
    def test_create_expense_sets_owner_from_token(self):
        payload = {
            "title": "Lunch",
            "amount": "180.50",
            "category": "food",
            "date": "2026-10-14",
        }
        response = self.client.post(reverse("expense-list"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn("user", response.data)
        self.assertEqual(Expense.objects.get().user, self.asha)

    def test_amount_must_be_positive(self):
        payload = {"title": "Bad", "amount": "0", "category": "food", "date": "2026-10-14"}
        response = self.client.post(reverse("expense-list"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("amount", response.data)

    def test_invalid_category_is_rejected(self):
        payload = {"title": "Bad", "amount": "10", "category": "xyz", "date": "2026-10-14"}
        response = self.client.post(reverse("expense-list"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", response.data)

    def test_unauthenticated_request_is_rejected(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse("expense-list"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_returns_only_own_expenses(self):
        self.make_expense(self.asha, title="Asha lunch")
        self.make_expense(self.ravi, title="Ravi lunch")
        response = self.client.get(reverse("expense-list"))
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(self.titles(response), ["Asha lunch"])

    def test_cannot_read_another_users_expense(self):
        other = self.make_expense(self.ravi)
        response = self.client.get(reverse("expense-detail", args=[other.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_update_another_users_expense(self):
        other = self.make_expense(self.ravi, amount="100.00")
        response = self.client.patch(
            reverse("expense-detail", args=[other.id]), {"amount": "1"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        other.refresh_from_db()
        self.assertEqual(other.amount, Decimal("100.00"))

    def test_cannot_delete_another_users_expense(self):
        other = self.make_expense(self.ravi)
        response = self.client.delete(reverse("expense-detail", args=[other.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Expense.objects.filter(id=other.id).exists())

    def test_update_own_expense(self):
        mine = self.make_expense(self.asha, amount="100.00")
        response = self.client.patch(
            reverse("expense-detail", args=[mine.id]), {"amount": "200"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mine.refresh_from_db()
        self.assertEqual(mine.amount, Decimal("200.00"))

    def test_delete_own_expense(self):
        mine = self.make_expense(self.asha)
        response = self.client.delete(reverse("expense-detail", args=[mine.id]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Expense.objects.filter(id=mine.id).exists())

    def test_filter_by_category(self):
        self.make_expense(self.asha, title="Lunch", category="food")
        self.make_expense(self.asha, title="Bus", category="transport")
        response = self.client.get(reverse("expense-list"), {"category": "food"})
        self.assertEqual(self.titles(response), ["Lunch"])

    def test_filter_by_month_and_year(self):
        self.make_expense(self.asha, title="October", day=date(2026, 10, 12))
        self.make_expense(self.asha, title="September", day=date(2026, 9, 28))
        response = self.client.get(reverse("expense-list"), {"month": 10, "year": 2026})
        self.assertEqual(self.titles(response), ["October"])

    def test_search_by_title(self):
        self.make_expense(self.asha, title="Metro card")
        self.make_expense(self.asha, title="Lunch")
        response = self.client.get(reverse("expense-list"), {"search": "metro"})
        self.assertEqual(self.titles(response), ["Metro card"])

    def test_ordering_by_amount_descending(self):
        self.make_expense(self.asha, title="Small", amount="100.00")
        self.make_expense(self.asha, title="Large", amount="500.00")
        self.make_expense(self.asha, title="Medium", amount="250.00")
        response = self.client.get(reverse("expense-list"), {"ordering": "-amount"})
        self.assertEqual(self.titles(response), ["Large", "Medium", "Small"])


class SummaryAPITests(BaseExpenseTest):
    def test_summary_totals_only_count_own_expenses(self):
        self.make_expense(self.asha, amount="100.00", category="food")
        self.make_expense(self.asha, amount="200.00", category="food")
        self.make_expense(self.asha, amount="50.00", category="transport")
        self.make_expense(self.asha, amount="1000.00", category="bills", day=date(2020, 1, 1))
        self.make_expense(self.ravi, amount="9999.00", category="shopping")

        response = self.client.get(reverse("summary"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_spent"], Decimal("1350.00"))
        self.assertEqual(response.data["current_month_total"], Decimal("350.00"))
        self.assertEqual(response.data["expense_count"], 4)
        self.assertEqual(response.data["top_category"], "bills")
        self.assertEqual(response.data["category_totals"][0]["category"], "bills")
        self.assertEqual(response.data["category_totals"][0]["total"], Decimal("1000.00"))

    def test_summary_for_user_with_no_expenses(self):
        self.client.force_authenticate(user=self.ravi)
        response = self.client.get(reverse("summary"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_spent"], Decimal("0.00"))
        self.assertEqual(response.data["expense_count"], 0)
        self.assertIsNone(response.data["top_category"])
        self.assertEqual(response.data["category_totals"], [])

    def test_summary_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse("summary"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)