FROM mcr.microsoft.com/playwright

WORKDIR /opt/playwright
ADD . /opt/playwright/
RUN npm install && npx playwright install

ENTRYPOINT ["./start.sh"]
