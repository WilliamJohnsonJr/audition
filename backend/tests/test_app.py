import unittest

from tests.actors_tests import ActorTestCase
from tests.casts_tests import CastTestCase
from tests.movies_tests import MovieTestCase


def suite():
    suite = unittest.TestSuite()
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(MovieTestCase))
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(ActorTestCase))
    suite.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(CastTestCase))
    return suite


if __name__ == "__main__":
    runner = unittest.TextTestRunner()
    runner.run(suite())
