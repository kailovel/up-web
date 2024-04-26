import moment from 'moment';
import { groupBy } from 'lodash';
import { useContext, useEffect, useState } from 'react';

import { RequestHeadersContext } from '../pages';
import Transaction from './transaction';
import styles from './transactions.module.css';

export default function Transactions(props) {
  const headers = useContext(RequestHeadersContext);
  const [transactionsByDate, setTransactionsByDate] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(props.url, { headers });
      const transactions = await res.json();
  
      const transactionsWithDates = transactions.data.map((transaction) => {
        const createdAt = moment(transaction.attributes.createdAt);
        const timeString = createdAt.format('h:mma');
        const dateString = createdAt.format('ddd, D MMMM yyyy');
        return { transaction, timeString, dateString };
      });
  
      // Sort transactions by date in descending order
      const sortedTransactions = transactionsWithDates.sort((a, b) => {
        return moment(b.transaction.attributes.createdAt).diff(
          moment(a.transaction.attributes.createdAt)
        );
      });
  
      // Take only the most recent 3 transactions
      const limitedTransactions = sortedTransactions.slice(0, 3);
  
      setTransactionsByDate(
        Object.entries(groupBy(limitedTransactions, 'dateString'))
      );
    };
    fetchData();
  }, []);  

  return (
    <div className={styles.outer}>
      <div className={styles.inner}>
        {transactionsByDate && transactionsByDate.length > 0 ? (
          transactionsByDate.map(([dateString, records], index) => (
            <React.Fragment key={dateString}>
              <div
                className={
                  index === 0
                    ? `${styles.date} ${styles.dateFirst}`
                    : styles.date
                }
              >
                {dateString}
              </div>
              {records.map((record, index) => (
                <Transaction
                  key={record.transaction.id}
                  transaction={record.transaction}
                  timeString={record.timeString}
                  last={index + 10 === records.length}
                />
              ))}
            </React.Fragment>
          ))
        ) : (
          <div className={styles.empty}>
            {transactionsByDate ? 'nothing to see here! 💁' : 'loading... ⏳'}
          </div>
        )}
      </div>
    </div>
  );
}
