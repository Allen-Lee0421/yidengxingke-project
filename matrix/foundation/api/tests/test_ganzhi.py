from django.test import TestCase
from api.services.ganzhi_resolver import GanzhiResolver

class GanzhiBoundaryTests(TestCase):
    def setUp(self):
        self.resolver = GanzhiResolver()

    def test_li_chun_boundary(self):
        payload_before = {"year":2025,"month":2,"day":4,"hour":14,"minute":29,"tz":"Asia/Taipei"}
        payload_after  = {"year":2025,"month":2,"day":4,"hour":14,"minute":30,"tz":"Asia/Taipei"}
        result_before = self.resolver.assemble(payload_before)
        result_after  = self.resolver.assemble(payload_after)
        self.assertNotEqual(result_before["ganzhi"]["year"], result_after["ganzhi"]["year"])