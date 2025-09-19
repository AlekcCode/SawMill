from django import forms
from django.contrib import admin
from main.models import SawMill


@admin.register(SawMill)
class SawMillAdmin(admin.ModelAdmin):
    list_display = ['category', 'size', 'price_1s_cube', 'price_2s_cube']