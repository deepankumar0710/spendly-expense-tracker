from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets

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