class AppException(Exception):

    def __init__(self, source: str, status_code: int, msg: str ) -> None:
        
        self.source = source
        self.status_code = status_code,
        self.msg = msg