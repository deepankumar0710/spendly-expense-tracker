from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Expense(models.Model):
    class Category(models.TextChoices):
        FOOD = "food", "Food"
        TRANSPORT = "transport", "Transport"
        SHOPPING = "shopping", "Shopping"
        BILLS = "bills", "Bills"
        ENTERTAINMENT = "entertainment", "Entertainment"
        OTHER = "other", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    title = models.CharField(max_length=100)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    date = models.DateField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.user})"