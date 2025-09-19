from django.db import models


class SawMill(models.Model):
    category = models.CharField(max_length=100)
    size = models.CharField(max_length=50)
    pieces_per_cube = models.CharField(max_length=50)
    price_1s_piece = models.DecimalField(max_digits=10, decimal_places=2)
    price_1s_cube = models.DecimalField(max_digits=10, decimal_places=2)
    price_2s_piece = models.DecimalField(max_digits=10, decimal_places=2)
    price_2s_cube = models.DecimalField(max_digits=10, decimal_places=2)
    photo = models.ImageField(upload_to='photos/', blank=True, null=True)

    class Meta:
        db_table = 'sawmill"."products'
        verbose_name = 'Пиломатериал'


# class SawMill(models.Model):
#     id = models.AutoField(primary_key=True)
#     title = models.TextField()
#     description = models.TextField()
#     price = models.CharField(max_length=100)
#     photo = models.ImageField(upload_to='photos/')
#
#     class Meta:
#         db_table = 'sawmill"."assortment'