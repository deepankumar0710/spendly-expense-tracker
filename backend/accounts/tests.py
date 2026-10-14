from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

PASSWORD = "Str0ngPass!234"


class AuthTests(APITestCase):
    def test_register_creates_user_without_returning_password(self):
        payload = {
            "username": "asha",
            "email": "asha@example.com",
            "password": PASSWORD,
            "password2": PASSWORD,
        }
        response = self.client.post(reverse("register"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="asha").exists())
        self.assertNotIn("password", response.data)

    def test_register_rejects_password_mismatch(self):
        payload = {
            "username": "asha",
            "email": "asha@example.com",
            "password": PASSWORD,
            "password2": "different",
        }
        response = self.client.post(reverse("register"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password2", response.data)

    def test_register_rejects_duplicate_email(self):
        User.objects.create_user("asha", "asha@example.com", PASSWORD)
        payload = {
            "username": "other",
            "email": "asha@example.com",
            "password": PASSWORD,
            "password2": PASSWORD,
        }
        response = self.client.post(reverse("register"), payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_login_returns_tokens(self):
        User.objects.create_user("asha", "asha@example.com", PASSWORD)
        response = self.client.post(
            reverse("login"), {"username": "asha", "password": PASSWORD}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_rejects_wrong_password(self):
        User.objects.create_user("asha", "asha@example.com", PASSWORD)
        response = self.client.post(
            reverse("login"), {"username": "asha", "password": "wrong"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)