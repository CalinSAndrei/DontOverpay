from abc import ABC, abstractmethod


class BaseScraper(ABC):

    @abstractmethod
    def get_price(self, url: str) -> float :
        pass

    @abstractmethod
    def get_name(self, url: str) -> str :
        pass



