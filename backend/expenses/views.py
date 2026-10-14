from decimal import Decimal

from django.db.models import Count, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .filters import ExpenseFilter
from .models import Expense
from .pagination import ExpensePagination
from .serializers import ExpenseSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    pagination_class = ExpensePagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ExpenseFilter
    search_fields = ["title", "notes"]
    ordering_fields = ["date", "amount", "created_at"]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SummaryView(APIView):
    def get(self, request):
        expenses = Expense.objects.filter(user=request.user)
        today = timezone.localdate()

        totals = expenses.aggregate(total=Sum("amount"), count=Count("id"))
        month_total = expenses.filter(
            date__year=today.year, date__month=today.month
        ).aggregate(total=Sum("amount"))["total"]

        category_totals = list(
            expenses.values("category")
            .annotate(total=Sum("amount"))
            .order_by("-total", "category")
        )

        return Response(
            {
                "total_spent": totals["total"] or Decimal("0.00"),
                "current_month_total": month_total or Decimal("0.00"),
                "expense_count": totals["count"],
                "top_category": category_totals[0]["category"] if category_totals else None,
                "category_totals": category_totals,
            }
        )